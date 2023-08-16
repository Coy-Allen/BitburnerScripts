import {NS, SourceFileLvl} from "@ns";
import {getSourceLevel} from "/lib/utils";
import {REQUIREMENTS, requirementTree} from "/generators/libs/part3Requirements";

type moduleImports = [
	folderName: string,
	fileName: string,
][];
interface fullRamCalculation {
	ram: number;
	nextCullTarget: calculationResult;
	selected: moduleImports;
}
interface calculationResult {
	folder: string;
	file: string;
	ram: number;
	priority: number;
}

const HOST = "home";

export function main(ns: NS): void {
	const sourceFiles = JSON.parse(ns.read("/generatorResults/part1.txt")) as SourceFileLvl[];
	ns.write("/generatorResults/part3.js", generate(ns, sourceFiles), "w");
	const bestScriptChain = [...ns.args] as string[];
	const nextScript = bestScriptChain.shift();
	ns.tprint(`Running ${nextScript?? "DONE"}.`);
	if (nextScript !== undefined) {ns.spawn(nextScript, 1, ...bestScriptChain);}
}

function generate(ns: NS, sourceFiles: SourceFileLvl[]): string {
	const choices: requirementTree = new Map();
	const maxRam = ns.getServerMaxRam(HOST);
	// add modules we can use into the choices object
	for (const [folderName, folder] of REQUIREMENTS) {
		// libs aren't modules
		if (folderName === "lib") {continue;}
		const folderCopy = {
			files: new Map(),
		};
		for (const [fileName, file] of folder.files) {
			if (!checkModule(file.requirements, sourceFiles)) {continue;}
			const validModule = {
				priority: file.priority,
				requirements: file.requirements, // FIXME: turn reference into deep copy
				ramUsage: ns.getScriptRam(`/lib/masterModules/${folderName}/${fileName}.js`, HOST),
			};
			// never use missing files
			if (validModule.ramUsage === 0) {continue;}
			// add valid module
			folderCopy.files.set(fileName, validModule);
		}
		if (folderCopy.files.size !== 0) {
			choices.set(folderName, folderCopy);
		}
	}

	// get/sort the possible options and make sure RAM usage is within limit
	let calcResult = calculateAll(choices);
	while (calcResult.ram > maxRam) {
		cullTarget(choices, calcResult.nextCullTarget);
		calcResult = calculateAll(choices);
	}
	return stringifyData(calcResult.selected);
}
function calculateAll(
	choices: requirementTree,
): fullRamCalculation {
	let total = 0;
	const possibleCullTarget: calculationResult = {
		folder: "",
		file: "",
		ram: -1,
		priority: -1,
	};
	const selected: [string, string][] = [];
	for (const [folderName] of choices) {
		const folderCalc = calculateFolder(choices, folderName);
		if (folderCalc === undefined) {
			choices.delete(folderName);
			continue;
		}
		if (possibleCullTarget.priority > folderCalc.priority) {
			possibleCullTarget.folder = folderCalc.folder;
			possibleCullTarget.file = folderCalc.file;
			possibleCullTarget.ram = folderCalc.ram;
			possibleCullTarget.priority = folderCalc.priority;
		}
		selected.push([folderCalc.folder, folderCalc.file]);
		total += folderCalc.ram;
	}
	return {
		ram: total,
		nextCullTarget: possibleCullTarget,
		selected: selected,
	};
}
function calculateFolder(
	choices: requirementTree,
	folderName: string,
): calculationResult|undefined {
	const calcResult: calculationResult = {
		folder: "",
		file: "",
		ram: 0,
		priority: -1,
	};
	const folder = choices.get(folderName);
	if (folder === undefined) {return;}
	calcResult.folder = folderName;
	for (const [fileName, file] of folder.files) {
		if (file.ramUsage === undefined) {
			folder.files.delete(fileName);
			continue;
		}
		if (calcResult.priority > file.priority) {continue;}
		calcResult.file = fileName;
		calcResult.ram = file.ramUsage;
		calcResult.priority = file.priority;
	}
	if (folder.files.size === 0) {return;}
	return calcResult;
}
function cullTarget(
	choices: requirementTree,
	target: calculationResult,
): void {
	const folder = choices.get(target.folder);
	if (folder === undefined) {
		throw new ReferenceError(`${target.folder} does not exist in choices object.`);
	}
	folder.files.delete(target.file);
	if (folder.files.size === 0) {
		choices.delete(target.folder);
	}
}

function checkModule(
	requirements: SourceFileLvl[],
	sourceFiles: SourceFileLvl[],
): boolean {
	for (const requirement of requirements) {
		if (getSourceLevel(sourceFiles, requirement.n) < requirement.lvl) {
			return false;
		}
	}
	// all requirements pass
	return true;
}
function stringifyData(modules: moduleImports): string {
	const imports = modules
		.map(module=>
			`import {${module[0]}} from "/lib/masterModules/${module[0]}/${module[1]}.js"\n`)
		.join("");
	const moduleList = `const MASTER_MODULES = new Map([${
		modules
			.map(module=>`[${module[0]},${module[0]}]`)
			.join(",")
	}]);\n`;
	return imports+moduleList;
}

import {NS, SourceFileLvl} from "@ns";
import {getSourceLevel} from "/lib/utils";
import {REQUIREMENTS, requirementTree} from "/generators/libs/part3Requirements";

type moduleImports = [
	folderName: string,
	fileName: string,
][];
interface fullRamCalculation {
	maxRam: number;
	maxRamScript: ramCalculation;
	selected: moduleImports;
}
interface ramCalculation {
	folder: string;
	file: string;
	ram: number;
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
			priority: folder.priority,
			files: new Map(),
		};
		for (const [fileName, file] of folder.files) {
			if (checkModule(file.requirements, sourceFiles)) {
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
		}
		if (folderCopy.files.size !== 0) {
			choices.set(folderName, folderCopy);
		}
	}

	// get/sort the possible options and make sure RAM usage is within limit
	const ramResult = calculateFullRam(choices);
	while (ramResult.maxRam > maxRam) {
		cullTarget(choices, ramResult.maxRamScript);
		recalculateFolderRam(choices, ramResult);
	}
	ramResult.selected;
	// TODO: turn selected into valid output
	return stringifyData(ramResult.selected);
}
function calculateFullRam(
	choices: requirementTree,
): fullRamCalculation {
	let total = 0;
	const maxTotalRam: ramCalculation = {
		folder: "",
		file: "",
		ram: -1,
	};
	const selected: [string, string][] = [];
	for (const [folderName] of choices) {
		const maxFolderRam = calculateFolderRam(choices, folderName);
		if (maxFolderRam.ram > maxTotalRam.ram) {
			maxTotalRam.folder = maxFolderRam.folder;
			maxTotalRam.file = maxFolderRam.file;
			maxTotalRam.ram = maxFolderRam.ram;
		}
		selected.push([maxFolderRam.folder, maxFolderRam.file]);
		total += maxFolderRam.ram;
	}
	return {
		maxRam: total,
		maxRamScript: {
			folder: maxTotalRam.folder,
			file: maxTotalRam.file,
			ram: maxTotalRam.ram,
		},
		selected: selected,
	};
}
function recalculateFolderRam(
	choices: requirementTree,
	calculation: fullRamCalculation,
): void {
	const folder = choices.get(calculation.maxRamScript.folder);
	const file = folder?.files.get(calculation.maxRamScript.file);
	if (file === undefined) {return;}
	const newCalc = calculateFolderRam(choices, calculation.maxRamScript.folder);
	calculation.maxRam -= calculation.maxRamScript.ram - newCalc.ram;
	calculation.maxRamScript = newCalc;
}
function calculateFolderRam(
	choices: requirementTree,
	folderName: string,
): ramCalculation {
	const maxFolderRam: ramCalculation = {
		folder: "",
		file: "",
		ram: -1,
	};
	const folder = choices.get(folderName);
	maxFolderRam.folder = folderName;
	if (folder === undefined) {return maxFolderRam;}
	for (const [fileName, file] of folder.files) {
		if (file.ramUsage === undefined) {
			folder.files.delete(fileName);
			continue;
		}
		if (maxFolderRam.ram > file.ramUsage) {continue;}
		maxFolderRam.file = fileName;
		maxFolderRam.ram = file.ramUsage;
	}
	return maxFolderRam;
}
function cullTarget(
	choices: requirementTree,
	target: ramCalculation,
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

import {NS, SourceFileLvl} from "@ns";
import {getSourceLevel} from "/lib/utils";
import {REQUIREMENTS, folderName, fileName, requirementList} from "/generators/libs/part3Requirements";

type moduleImports = {importFile: string; importClass: string; moduleName: string}[];

export function main(ns: NS): void {
	const sourceFiles = JSON.parse(ns.read("/generatorResults/part1.txt")) as SourceFileLvl[];
	ns.write("/generatorResults/part3.js", generate(ns, sourceFiles), "w");
	const bestScriptChain = [...ns.args] as string[];
	const nextScript = bestScriptChain.shift();
	ns.tprint(`Running ${nextScript?? "DONE"}.`);
	if (nextScript !== undefined) {ns.spawn(nextScript, 1, ...bestScriptChain);}
}

function generate(_ns: NS, sourceFiles: SourceFileLvl[]): string {
	// filter out invalid modules
	for (const [folder, subTree] of REQUIREMENTS) {
		for (const [file, requirements] of subTree) {
			if (!checkModule(requirements, sourceFiles)) {
				// remove invalid module
				REQUIREMENTS.get(folder)?.delete(file);
			}
		}
	}
	return stringifyData([]);
}
function checkModule(
	requirements: requirementList,
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
		.map(module=>`import {${module.importClass}} from "${module.importFile}"\n`)
		.join("");
	const moduleList = `const MASTER_MODULES = new Map([${
		modules
			.map(module=>`[${module.moduleName},${module.importClass}]`)
			.join(",")
	}]);\n`;
	return imports+moduleList;
}

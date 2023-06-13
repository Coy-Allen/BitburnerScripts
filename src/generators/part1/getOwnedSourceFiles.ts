import {NS, SourceFileLvl} from "@ns";

export function main(ns: NS): void {
	ns.write("/generatorResults/part1.txt", JSON.stringify(generate(ns)), "w");
	const bestScriptChain = [...ns.args] as string[];
	const nextScript = bestScriptChain.shift();
	if (nextScript !== undefined) {ns.spawn(nextScript, 1, ...bestScriptChain);}
}

function generate(ns: NS): SourceFileLvl[] {
	return ns.singularity.getOwnedSourceFiles();
}

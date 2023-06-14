import {NS, SourceFileLvl} from "@ns";

export function main(ns: NS): void {
	ns.write("/generatorResults/part1.txt", JSON.stringify(generate(ns)), "w");
	const bestScriptChain = [...ns.args] as string[];
	const nextScript = bestScriptChain.shift();
	ns.tprint(`Running ${nextScript?? "DONE"}.`);
	if (nextScript !== undefined) {ns.spawn(nextScript, 1, ...bestScriptChain);}
}

// alternative

function generate(ns: NS): SourceFileLvl[] {
	return ns.singularity.getOwnedSourceFiles();
}

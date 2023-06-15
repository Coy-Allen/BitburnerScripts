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
	try {
		return ns.singularity.getOwnedSourceFiles();
	} catch {
		// dont own source file 5. run backup script.
		const alternativeChain = [...ns.args] as string[];
		alternativeChain.shift();
		ns.spawn("/generators/part1/tryCatch.js", 1, ...alternativeChain);
		return [];
	}
}

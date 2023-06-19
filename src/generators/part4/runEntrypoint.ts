import {NS, SourceFileLvl} from "@ns";
import {getBitnodeMult, getFormulas} from "/generatorResults/part2.js";
import {MASTER_MODULES} from "/generatorResults/part3.js";
import {mastermind} from "/lib/mastermind";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("sleep");
	const sourceFiles = JSON.parse(ns.read("/generatorResults/part1.txt")) as SourceFileLvl[];
	const bitnodeMults = getBitnodeMult(ns);
	const formulas = getFormulas(ns, bitnodeMults);
	const master = new mastermind(ns, formulas, sourceFiles, MASTER_MODULES);
	await master.run(100);
}

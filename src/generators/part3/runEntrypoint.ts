import {NS, SourceFileLvl} from "@ns";
import {getBitnodeMult, getFormulas} from "/generatorResults/part2.js";
import {remoteMasterBase} from "/lib/remoteMasterBase";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("sleep");
	const sourceFiles = JSON.parse(ns.read("/generatorResults/part1.txt")) as SourceFileLvl[];
	const bitnodeMults = getBitnodeMult(ns);
	const formulas = getFormulas(ns, bitnodeMults);
	const master = new remoteMasterBase(ns, formulas, sourceFiles);
	await master.run(100);
}

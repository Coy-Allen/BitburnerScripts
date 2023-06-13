import {NS} from "@ns";
import {getBitnodeMult, getFormulas} from "/generatorResults/part2.js";
import {remoteMasterBase} from "/lib/remoteMasterBase";

export async function main(ns: NS) {
	ns.disableLog("sleep");
	const bitnodeMults = getBitnodeMult(ns);
	const formulas = getFormulas(ns, bitnodeMults);
	const master = new remoteMasterBase(ns, formulas);
	await master.run(100);
}

import {NS, SourceFileLvl} from "@ns";

type imports = Map<string, string[]>;
type functions = Set<string>;

export function main(ns: NS): void {
	ns.write("/generatorResults/part2.js", generate(ns), "w");
	const bestScriptChain = [...ns.args] as string[];
	const nextScript = bestScriptChain.shift();
	if (nextScript !== undefined) {ns.spawn(nextScript, 1, ...bestScriptChain);}
}

function getSourceLevel(sourceFiles: SourceFileLvl[], n: SourceFileLvl["n"]): SourceFileLvl["lvl"] {
	return sourceFiles.find(sourceFile=>sourceFile.n === n)?.lvl ?? 0;
}

function generate(ns: NS): string {
	const imports: imports = new Map<string, string[]>();
	const functions: functions = new Set<string>();
	const sourceFiles = JSON.parse(ns.read("/generatorResults/part1.txt")) as SourceFileLvl[];
	getBitnodeMult(ns, imports, functions, sourceFiles);
	getFormulas(ns, imports, functions, sourceFiles);
	return stringifyData(imports, functions);
}

function stringifyData(imports: imports, functions: functions): string {
	// TODO: stub
	let result = [...imports.entries()].map(([filename, variables]): string=>`import {${variables.join(",")}} from ${filename}\n`).join("");
	result += [...functions.entries()].join("\n");
	return result;
}

// alternative generators

function getBitnodeMult(_ns: NS, _imports: imports, functions: functions, sourceFiles: SourceFileLvl[]): void {
	let funct = "function getBitnodeMult(ns) {\n\treturn ";
	if (getSourceLevel(sourceFiles, 5) >= 1) {
		funct+="ns.getBitNodeMultipliers()";
	} else {
		funct+="{AgilityLevelMultiplier: 1, AugmentationMoneyCost: 1, AugmentationRepCost: 1, BladeburnerRank: 1, BladeburnerSkillCost: 1, CharismaLevelMultiplier: 1, ClassGymExpGain: 1, CodingContractMoney: 1, CompanyWorkExpGain: 1, CompanyWorkMoney: 1, CorporationSoftcap: 1, CorporationValuation: 1, CrimeExpGain: 1, CrimeMoney: 1, DaedalusAugsRequirement: 30, DefenseLevelMultiplier: 1, DexterityLevelMultiplier: 1, FactionPassiveRepGain: 1, FactionWorkExpGain: 1, FactionWorkRepGain: 1, FourSigmaMarketDataApiCost: 1, FourSigmaMarketDataCost: 1, GangSoftcap: 1, HackExpGain: 1, HackingLevelMultiplier: 1, HacknetNodeMoney: 1, HomeComputerRamCost: 1, InfiltrationMoney: 1, InfiltrationRep: 1, ManualHackMoney: 1, PurchasedServerCost: 1, PurchasedServerLimit: 1, PurchasedServerMaxRam: 1, PurchasedServerSoftcap: 1, RepToDonateToFaction: 1, ScriptHackMoney: 1, ScriptHackMoneyGain: 1, ServerGrowthRate: 1, ServerMaxMoney: 1, ServerStartingMoney: 1, ServerStartingSecurity: 1, ServerWeakenRate: 1, StrengthLevelMultiplier: 1, StaneksGiftPowerMultiplier: 1, StaneksGiftExtraSize: 0, WorldDaemonDifficulty: 1}";
	}
	funct+=";\n};";
	functions.add(funct);
}
function getFormulas(ns: NS, imports: imports, functions: functions, sourceFiles: SourceFileLvl[]): void {
	let funct = "function getFormulas(ns, bitNodeMults) {\n\treturn ";
	if (ns.fileExists("formulas.exe") || getSourceLevel(sourceFiles, 5) >= 1) {
		funct+="ns.formulas";
	} else {
		imports.set("/lib/dumbFormulas", ["dumbFormulas"]);
		funct+="new dumbFormulas(bitNodeMults)";
	}
	funct+=";\n};";
	functions.add(funct);
}

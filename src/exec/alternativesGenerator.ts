import {NS, SourceFileLvl} from "@ns";

type imports = Map<string, string[]>;
type functions = Set<string>;
type info = Map<string, boolean>;

export async function main(ns: NS): Promise<void> {
	ns.disableLog("sleep");
	const filename = "/generated/remoteMaster.js";
	ns.kill(filename, ns.getHostname());
	ns.write(filename, generateFile(ns), "w");
	await ns.sleep(100);
	ns.run(filename);
}

function generateFile(ns: NS) {
	const imports: imports = new Map<string, string[]>();
	const functions: functions = new Set<string>();
	const info: info = new Map<string, boolean>; // TODO: generate info
	getBitnodeMult(imports, functions, info);
	getFormulas(imports, functions, info);
	return stringifyData(imports, functions);
}


function stringifyData(imports: imports, functions: functions): string {
	// TODO: stub
	let result = [...imports.entries()].map(([filename, variables])=>`import {${variables.join(",")}} from ${filename}\n`).join("");
	result += [...functions.entries()].join("\n");
	return result;
}

// alternative generators

function getBitnodeMult(_imports: imports, functions: functions, info: info) {
	let funct = "function getBitnodeMult(ns) {\n\treturn ";
	if (info.get("bitnode5")) {
		funct+="ns.getBitNodeMultipliers()";
	} else {
		funct+="{AgilityLevelMultiplier: 1, AugmentationMoneyCost: 1, AugmentationRepCost: 1, BladeburnerRank: 1, BladeburnerSkillCost: 1, CharismaLevelMultiplier: 1, ClassGymExpGain: 1, CodingContractMoney: 1, CompanyWorkExpGain: 1, CompanyWorkMoney: 1, CorporationSoftcap: 1, CorporationValuation: 1, CrimeExpGain: 1, CrimeMoney: 1, DaedalusAugsRequirement: 30, DefenseLevelMultiplier: 1, DexterityLevelMultiplier: 1, FactionPassiveRepGain: 1, FactionWorkExpGain: 1, FactionWorkRepGain: 1, FourSigmaMarketDataApiCost: 1, FourSigmaMarketDataCost: 1, GangSoftcap: 1, HackExpGain: 1, HackingLevelMultiplier: 1, HacknetNodeMoney: 1, HomeComputerRamCost: 1, InfiltrationMoney: 1, InfiltrationRep: 1, ManualHackMoney: 1, PurchasedServerCost: 1, PurchasedServerLimit: 1, PurchasedServerMaxRam: 1, PurchasedServerSoftcap: 1, RepToDonateToFaction: 1, ScriptHackMoney: 1, ScriptHackMoneyGain: 1, ServerGrowthRate: 1, ServerMaxMoney: 1, ServerStartingMoney: 1, ServerStartingSecurity: 1, ServerWeakenRate: 1, StrengthLevelMultiplier: 1, StaneksGiftPowerMultiplier: 1, StaneksGiftExtraSize: 0, WorldDaemonDifficulty: 1}";
	}
	funct+=";\n};";
	functions.add(funct);
}
function getFormulas(imports: imports, functions: functions, info: info) {
	let funct = "function getFormulas(ns, bitNodeMults) {\n\treturn ";
	if (info.get("formulaFile")) {
		funct+="ns.formulas";
	} else {
		imports.set("/lib/dumbFormulas", ["dumbFormulas"]);
		funct+="new dumbFormulas(bitNodeMults)";
	}
	funct+=";\n};";
	functions.add(funct);
}

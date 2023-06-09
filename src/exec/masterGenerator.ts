import {NS, SourceFileLvl} from "@ns";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("sleep");
	const filename = "/generated/remoteMaster.js";
	ns.kill(filename, ns.getHostname());
	ns.write(filename, generateFile(ns), "w");
	await ns.sleep(100);
	ns.run(filename);
}

function grabSourceFiles(ns: NS): SourceFileLvl[] {
	return [{n: 1, lvl: 2}];
	return JSON.parse(ns.read("config/SourceFileList.txt")) as SourceFileLvl[];
}

function generateFile(ns: NS): string {
	const hasFormula = ns.fileExists("Formulas.exe");
	const hasBitNode5File = grabSourceFiles(ns).find(file=>file.n===5) !== undefined;
	return `
import {dumbFormulas} from "/lib/dumbFormulas";
import {remoteMasterBase} from "/lib/remoteMasterBase";

function getBitnodeMult(ns) {
	return ${hasBitNode5File?
		"ns.getBitNodeMultipliers()":
		"{AgilityLevelMultiplier: 1, AugmentationMoneyCost: 1, AugmentationRepCost: 1, BladeburnerRank: 1, BladeburnerSkillCost: 1, CharismaLevelMultiplier: 1, ClassGymExpGain: 1, CodingContractMoney: 1, CompanyWorkExpGain: 1, CompanyWorkMoney: 1, CorporationSoftcap: 1, CorporationValuation: 1, CrimeExpGain: 1, CrimeMoney: 1, DaedalusAugsRequirement: 30, DefenseLevelMultiplier: 1, DexterityLevelMultiplier: 1, FactionPassiveRepGain: 1, FactionWorkExpGain: 1, FactionWorkRepGain: 1, FourSigmaMarketDataApiCost: 1, FourSigmaMarketDataCost: 1, GangSoftcap: 1, HackExpGain: 1, HackingLevelMultiplier: 1, HacknetNodeMoney: 1, HomeComputerRamCost: 1, InfiltrationMoney: 1, InfiltrationRep: 1, ManualHackMoney: 1, PurchasedServerCost: 1, PurchasedServerLimit: 1, PurchasedServerMaxRam: 1, PurchasedServerSoftcap: 1, RepToDonateToFaction: 1, ScriptHackMoney: 1, ScriptHackMoneyGain: 1, ServerGrowthRate: 1, ServerMaxMoney: 1, ServerStartingMoney: 1, ServerStartingSecurity: 1, ServerWeakenRate: 1, StrengthLevelMultiplier: 1, StaneksGiftPowerMultiplier: 1, StaneksGiftExtraSize: 0, WorldDaemonDifficulty: 1}"
};
}
function getFormulas(ns, bitNodeMults) {
	return ${hasFormula?
		"ns.formulas":
		"new dumbFormulas(bitNodeMults)"
};
}

export async function main(ns) {
	ns.disableLog("sleep");
	const bitnodeMults = getBitnodeMult(ns);
	const formulas = getFormulas(ns, bitnodeMults);
	const master = new remoteMasterBase(ns, formulas);
	await master.run(100);
}
`;
}

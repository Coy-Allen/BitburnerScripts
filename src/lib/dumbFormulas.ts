/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
import {
	BitNodeMultipliers,
	Formulas,
	CrimeType,
	GymType,
	UniversityClassType,
	FactionWorkType,
	JobName,
	GangGenInfo,
	GangMemberInfo,
	GangTaskStats,
	WorkStats,
	HacknetServerConstants,
	HacknetNodeConstants,
	GangFormulas,
	HackingFormulas,
	HacknetNodesFormulas,
	HacknetServersFormulas,
	Person,
	Player,
	ReputationFormulas,
	Server,
	SkillsFormulas,
	WorkFormulas,
}  from "@ns";

let BitNodeMultipliers: BitNodeMultipliers;
function calculateIntelligenceBonus(intelligence: number, weight = 1): number {
	return 1 + weight * Math.pow(intelligence, 0.8) / 600;
}

export class dumbFormulas implements Formulas {
	constructor(bitNodeMultipliers: BitNodeMultipliers) {
		BitNodeMultipliers = bitNodeMultipliers;
	}
	mockServer(): Server {
		throw new Error("Method not implemented: mockServer");
	}
	mockPlayer(): Player {
		throw new Error("Method not implemented: mockPlayer");
	}
	mockPerson(): Person {
		throw new Error("Method not implemented: mockPerson");
	}
	reputation: ReputationFormulas = {
		calculateFavorToRep: function(favor: number): number {
			throw new Error("Function not implemented: calculateFavorToRep");
		},
		calculateRepToFavor: function(rep: number): number {
			throw new Error("Function not implemented: calculateRepToFavor");
		},
		repFromDonation: function(amount: number, player: Person): number {
			throw new Error("Function not implemented: repFromDonation");
		},
	};
	skills: SkillsFormulas = {
		calculateSkill: function(exp: number, skillMult?: number): number {
			throw new Error("Function not implemented: calculateSkill");
		},
		calculateExp: function(skill: number, skillMult?: number): number {
			throw new Error("Function not implemented: calculateExp");
		},
	};
	hacking: HackingFormulas = {
		hackChance: function(server: Server, player: Person): number {
			const skillMult = 1.75 * player.skills.hacking;
			const chance =
				(skillMult - server.requiredHackingSkill) / skillMult *
				((100 - server.hackDifficulty) / 100) *
				player.mults.hacking_chance *
				calculateIntelligenceBonus(player.skills.intelligence, 1);
			return Math.max(0, Math.min(chance, 1));
		},
		hackExp: function(server: Server, player: Person): number {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			const expGain = 3 + (server.baseDifficulty??server.hackDifficulty) * 0.3;
			return expGain * player.mults.hacking_exp * BitNodeMultipliers.HackExpGain;
		},
		hackPercent: function(server: Server, player: Person): number {
			const percent =
				(100 - server.hackDifficulty) / 100 *
				((player.skills.hacking - (server.requiredHackingSkill - 1)) / player.skills.hacking) *
				player.mults.hacking_money *
				BitNodeMultipliers.ScriptHackMoney /
				240;
			return Math.max(0, Math.min(percent, 1));
		},
		growPercent: function(server: Server, threads: number, player: Person, cores=1): number {
			const numServerGrowthCycles = Math.max(Math.floor(threads), 0);
			const growthRate = 1.03;
			let adjGrowthRate = 1 + (growthRate - 1) / server.hackDifficulty;
			if (adjGrowthRate > 1.0035) {
				adjGrowthRate = 1.0035;
			}
			const serverGrowthPercentage = server.serverGrowth / 100;
			const numServerGrowthCyclesAdjusted =
				numServerGrowthCycles * serverGrowthPercentage * BitNodeMultipliers.ServerGrowthRate;
			const coreBonus = 1 + (cores - 1) / 16;
			const result = Math.pow(adjGrowthRate, numServerGrowthCyclesAdjusted * player.mults.hacking_grow * coreBonus);
			return result;
		},
		hackTime: function(server: Server, player: Person): number {
			return 5 * ((2.5 * (server.requiredHackingSkill * server.hackDifficulty) + 500) / (player.skills.hacking + 50)) /
				(player.mults.hacking_speed * calculateIntelligenceBonus(player.skills.intelligence, 1));
		},
		growTime: function(server: Server, player: Person): number {
			throw new Error("Function not implemented: growTime");
		},
		weakenTime: function(server: Server, player: Person): number {
			throw new Error("Function not implemented: weakenTime");
		},
		growThreads: function(server: Server, player: Person, targetMoney: number, cores?: number | undefined): number {
			throw new Error("Function not implemented.");
		},
	};
	hacknetNodes: HacknetNodesFormulas = {
		moneyGainRate: function(level: number, ram: number, cores: number, mult=1): number {
			const gainPerLevel = 1.5;
			const levelMult = level * gainPerLevel;
			const ramMult = Math.pow(1.035, ram - 1);
			const coresMult = (cores + 5) / 6;
			return levelMult * ramMult * coresMult * mult * BitNodeMultipliers.HacknetNodeMoney;
		},
		levelUpgradeCost: function(startingLevel: number, extraLevels?: number, costMult?: number): number {
			throw new Error("Function not implemented: levelUpgradeCost");
		},
		ramUpgradeCost: function(startingRam: number, extraLevels?: number, costMult?: number): number {
			throw new Error("Function not implemented: ramUpgradeCost");
		},
		coreUpgradeCost: function(startingCore: number, extraCores?: number, costMult?: number): number {
			throw new Error("Function not implemented: coreUpgradeCost");
		},
		hacknetNodeCost: function(n: number, mult: number): number {
			throw new Error("Function not implemented: hacknetNodeCost");
		},
		constants: function(): HacknetNodeConstants {
			return {
				MoneyGainPerLevel: 1.5,
				BaseCost: 1000,
				LevelBaseCost: 1,
				RamBaseCost: 30e3,
				CoreBaseCost: 500e3,
				PurchaseNextMult: 1.85,
				UpgradeLevelMult: 1.04,
				UpgradeRamMult: 1.28,
				UpgradeCoreMult: 1.48,
				MaxLevel: 200,
				MaxRam: 64,
				MaxCores: 16,
			};
		},
	};
	hacknetServers: HacknetServersFormulas = {
		hashGainRate: function(level: number, ramUsed: number, maxRam: number, cores: number, mult?: number): number {
			throw new Error("Function not implemented: hashGainRate");
		},
		levelUpgradeCost: function(startingLevel: number, extraLevels?: number, costMult?: number): number {
			throw new Error("Function not implemented: levelUpgradeCost");
		},
		ramUpgradeCost: function(startingRam: number, extraLevels?: number, costMult?: number): number {
			throw new Error("Function not implemented: ramUpgradeCost");
		},
		coreUpgradeCost: function(startingCore: number, extraCores?: number, costMult?: number): number {
			throw new Error("Function not implemented: coreUpgradeCost");
		},
		cacheUpgradeCost: function(startingCache: number, extraCache?: number): number {
			throw new Error("Function not implemented: cacheUpgradeCost");
		},
		hashUpgradeCost: function(upgName: number, level: number): number {
			throw new Error("Function not implemented: hashUpgradeCost");
		},
		hacknetServerCost: function(n: number, mult?: number): number {
			throw new Error("Function not implemented: hacknetServerCost");
		},
		constants: function(): HacknetServerConstants {
			return {
				HashesPerLevel: 0.001,
				BaseCost: 50e3,
				RamBaseCost: 200e3,
				CoreBaseCost: 1e6,
				CacheBaseCost: 10e6,
				PurchaseMult: 3.2,
				UpgradeLevelMult: 1.1,
				UpgradeRamMult: 1.4,
				UpgradeCoreMult: 1.55,
				UpgradeCacheMult: 1.85,
				MaxServers: 20,
				MaxLevel: 300,
				MaxRam: 8192,
				MaxCores: 128,
				MaxCache: 15,
			};
		},
	};
	gang: GangFormulas = {
		wantedPenalty: function(gang: GangGenInfo): number {
			throw new Error("Function not implemented: wantedPenalty");
		},
		respectGain: function(gang: GangGenInfo, member: GangMemberInfo, task: GangTaskStats): number {
			throw new Error("Function not implemented: respectGain");
		},
		wantedLevelGain: function(gang: GangGenInfo, member: GangMemberInfo, task: GangTaskStats): number {
			throw new Error("Function not implemented: wantedLevelGain");
		},
		moneyGain: function(gang: GangGenInfo, member: GangMemberInfo, task: GangTaskStats): number {
			throw new Error("Function not implemented: moneyGain");
		},
		ascensionPointsGain: function(exp: number): number {
			throw new Error("Function not implemented: ascensionPointsGain");
		},
		ascensionMultiplier: function(points: number): number {
			throw new Error("Function not implemented: ascensionMultiplier");
		},
	};
	work: WorkFormulas = {
		crimeSuccessChance: function(person: Person, crimeType: CrimeType): number {
			throw new Error("Function not implemented: crimeSuccessChance");
		},
		crimeGains: function(person: Person, crimeType: CrimeType): WorkStats {
			throw new Error("Function not implemented: crimeGains");
			return {
				money: 0,
				reputation: 0,
				hackExp: 0,
				strExp: 0,
				defExp: 0,
				dexExp: 0,
				agiExp: 0,
				chaExp: 0,
				intExp: 0,
			};
		},
		gymGains: function(person: Person, gymType: GymType, locationName: string): WorkStats {
			throw new Error("Function not implemented: gymGains");
			return {
				money: 0,
				reputation: 0,
				hackExp: 0,
				strExp: 0,
				defExp: 0,
				dexExp: 0,
				agiExp: 0,
				chaExp: 0,
				intExp: 0,
			};
		},
		universityGains: function(person: Person, classType: UniversityClassType, locationName: string): WorkStats {
			throw new Error("Function not implemented: universityGains");
			return {
				money: 0,
				reputation: 0,
				hackExp: 0,
				strExp: 0,
				defExp: 0,
				dexExp: 0,
				agiExp: 0,
				chaExp: 0,
				intExp: 0,
			};
		},
		factionGains: function(person: Person, workType: FactionWorkType, favor: number): WorkStats {
			throw new Error("Function not implemented: factionGains");
			return {
				money: 0,
				reputation: 0,
				hackExp: 0,
				strExp: 0,
				defExp: 0,
				dexExp: 0,
				agiExp: 0,
				chaExp: 0,
				intExp: 0,
			};
		},
		companyGains: function(person: Person, companyName: string, workType: JobName, favor: number): WorkStats {
			throw new Error("Function not implemented: companyGains");
			return {
				money: 0,
				reputation: 0,
				hackExp: 0,
				strExp: 0,
				defExp: 0,
				dexExp: 0,
				agiExp: 0,
				chaExp: 0,
				intExp: 0,
			};
		},
	};
}

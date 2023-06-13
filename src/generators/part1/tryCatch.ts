import {NS, SourceFileLvl} from "@ns";

export function main(ns: NS): void {
	ns.write("/generatorResults/part1.txt", JSON.stringify(generate(ns)), "w");
	const bestScriptChain = [...ns.args] as string[];
	const nextScript = bestScriptChain.shift();
	if (nextScript !== undefined) {ns.spawn(nextScript, 1, ...bestScriptChain);}
}

function generate(ns: NS): SourceFileLvl[] {
	const generated: SourceFileLvl[] = [];
	// Starting node. extra ram. check not needed
	generated.push({n: 1, lvl: 0});

	// Gangs
	generated.push({n: 2, lvl: ((): number=> {
		try {
			ns.gang.getBonusTime();
			return 1;
		} catch {
			return 0;
		}
	})()});

	// Corperations
	generated.push({n: 3, lvl: ((): number=> {
		// Ram cost of 1024 is too high to check and this alternative has VERY high false negatives.
		return Number(ns.corporation.hasCorporation());
		/*
		try {
			ns.corporation.getCorporation();
			return 1;
		} catch {
			return 0;
		}
		*/
	})()});

	// Singularity
	generated.push({n: 4, lvl: ((): number=> {
		try {
			// ram cost of either 1.6, 0.4, or 0.1
			ns.singularity.isFocused();
			return 1;
		} catch {
			return 0;
		}
	})()});

	// getBitNodeMultipliers & Intelligence
	generated.push({n: 5, lvl: ((): number=> {
		try {
			ns.getBitNodeMultipliers();
			return 1;
		} catch {
			return 0;
		}
	})()});

	// manual Bladeburner. check not needed
	generated.push({n: 6, lvl: 0});

	// Bladeburner API
	generated.push({n: 7, lvl: ((): number=> {
		try {
			ns.bladeburner.getBonusTime();
			return 1;
		} catch {
			return 0;
		}
	})()});

	// stocks
	generated.push({n: 8, lvl: ((): number=> {
		if (!ns.stock.hasTIXAPIAccess()) {return 0;}
		try {
			ns.stock.sellShort("biz", 0);
			try {
				ns.stock.getOrders();
				return 3;
			} catch {
				return 2;
			}
		} catch {
			return 1;
		}
	})()});

	// Hacknet Server
	generated.push({n: 9, lvl: ((): number=> {
		if (ns.hacknet.hashCapacity()>0) {return 1;}
		return 0;
	})()});

	// sleeve / grafting
	generated.push({n: 10, lvl: ((): number=> {
		try {
			ns.sleeve.getNumSleeves();
			return 1;
		} catch {
			return 0;
		}
	})()});

	// company salary bonus. check not needed
	generated.push({n: 11, lvl: 0});

	// start level of neuroflux generator. check not needed
	generated.push({n: 12, lvl: 0});

	// church of machine god
	// TODO: fixme
	generated.push({n: 13, lvl: 0});

	return generated;
}

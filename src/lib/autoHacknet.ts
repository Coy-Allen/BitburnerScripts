import {Formulas, NS} from "@ns";

// TODO: this was a raw copy paste. might need a rework

export async function checkHacknetNodes(ns: NS, calc: Formulas): Promise<void> {
	let hasFailed = false;
	const hn = ns.hacknet;
	let targetNodes = 12;
	if (targetNodes < 0) {return;}
	if (targetNodes === 0) {targetNodes = hn.maxNumNodes();}
	if (ns.hacknet.numNodes() === targetNodes) {
		return;
	}
	while (!hasFailed) {
		let minPayoffLimit = Number.MAX_SAFE_INTEGER;
		let targetInfo: [null|number, null|number] = [null, null];
		const upgradeDiffs: [number, number, number][] = [];
		const upgradeCosts = [];
		if (
			hn.numNodes() < targetNodes &&
			hn.getPurchaseNodeCost() / calc.hacknetNodes.moneyGainRate(1, 1, 1) < minPayoffLimit
		) {
			minPayoffLimit = hn.getPurchaseNodeCost() / calc.hacknetNodes.moneyGainRate(1, 1, 1);
			targetInfo = [-1, 0];
		}
		for (let i = 0; i < hn.numNodes(); i++) {
			const nodeInfo = hn.getNodeStats(i);
			const guessmoney = calc.hacknetNodes.moneyGainRate(nodeInfo.level, nodeInfo.ram, nodeInfo.cores);
			upgradeDiffs[i] = [
				calc.hacknetNodes.moneyGainRate(nodeInfo.level+1, nodeInfo.ram, nodeInfo.cores) - guessmoney,
				calc.hacknetNodes.moneyGainRate(nodeInfo.level, nodeInfo.ram*2, nodeInfo.cores) - guessmoney,
				calc.hacknetNodes.moneyGainRate(nodeInfo.level, nodeInfo.ram, nodeInfo.cores+1) - guessmoney,
			];
			upgradeCosts[i] = [
				hn.getLevelUpgradeCost(i, 1),
				hn.getRamUpgradeCost(i, 1),
				hn.getCoreUpgradeCost(i, 1),
			];
			// loop through each type of upgrade
			for (let o = 0; o < 3; o++) {
				// log(i + "-" + o + ": " + upgradeCosts[i][o] / upgradeDiffs[i][o]);
				if (
					Number.isFinite(upgradeCosts[i][o]) && upgradeCosts[i][o] > 0 &&
					upgradeCosts[i][o] / upgradeDiffs[i][o] < minPayoffLimit
				) {
					minPayoffLimit = upgradeCosts[i][o] / upgradeDiffs[i][o];
					targetInfo = [i, o];
				}
			}
		}
		// log("MIN: " + minPayoffLimit);
		// log("TARG: " + targetInfo);
		// buy if possible
		if (targetInfo[0] === null || targetInfo[1] === null) {return;}
		if (targetInfo[0] === -1) {
			if (targetInfo[1] === 0) {
				hasFailed = hn.purchaseNode() === -1;
			}
		} else {
			switch (targetInfo[1]) {
				case 0: {hasFailed = !hn.upgradeLevel(targetInfo[0], 1); break;}
				case 1: {hasFailed = !hn.upgradeRam(targetInfo[0], 1); break;}
				case 2: {hasFailed = !hn.upgradeCore(targetInfo[0], 1); break;}
			}
		}
		await ns.sleep(1);
	}
	// NOTE: the upgrade path should not change. so we can have a hard coded array for all nodes to follow
	//     and just keep track of the position in the array.
	//     we can also hard code halts that tell the program to buy a new node.
}

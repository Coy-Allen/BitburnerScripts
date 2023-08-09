import {Formulas, NS, HacknetNodeConstants} from "@ns";
import {getBestAction, mainState, masterModule} from "/lib/masterModules/masterModuleTypes";
import {responseData} from "/lib/networking";

// TODO: this was a raw copy paste. might need a rework

interface upgradeTarget {
	name: string;
	count: number;
}
type upgrades = [
	level: number,
	ram: number,
	cores: number,
];
type calcResult = [
	cost: number,
	gainRate: number,
];

export abstract class hackingBase implements masterModule {
	protected name: string|undefined;
	protected state: mainState|undefined;
	protected upgradeChain: upgradeTarget[] = [];
	initalize(name: string, state: mainState): void {
		this.name = name;
		this.state = state;
	}
	requestHandler(_from: string, command: string, args: string[]): Promise<responseData> {
		// TODO: stub
	}
	getBestAction(): Promise<getBestAction | undefined> {
		// TODO: stub
	}
	protected calculateUpgradeChain(valueMetric:(calcResult:calcResult)=>number): void {
		if (this.state === undefined) {return;}
		// always start with first node purchase
		const upgradePath: upgradeTarget[] = [{name: "node", count: 1}];
		let nextUpgrade: upgradeTarget|undefined;
		const upgrades: upgrades = [1, 1, 1];
		let nodeCount = 1;
		let currentGainRate = this.state.calc.hacknetNodes.moneyGainRate(...upgrades);
		let possibleNextUpgrade: upgradeTarget|undefined;
		while (true) {
			// TODO: find best path
			// apply to path and get ready for next loop
			if (nextUpgrade === undefined) {
				break;
			}
			if (nextUpgrade.name === "node") {nodeCount += nextUpgrade.count;}
			this.addUpgradeToPath(upgradePath, nextUpgrade);
			nextUpgrade = undefined;
			possibleNextUpgrade = undefined;
		}
	}
	protected addUpgradeToPath(upgradePath: upgradeTarget[], nextUpgrade: upgradeTarget): void {
		const lastUpgrade = upgradePath[upgradePath.length-1];
		if (lastUpgrade.name !== nextUpgrade.name) {
			upgradePath.push(nextUpgrade);
			return;
		}
		lastUpgrade.count += nextUpgrade.count;
	}
	protected calcNewNode(
		nodeCount: number,
		upgrades: upgrades,
		currentGainRate: number,
		_constants: HacknetNodeConstants,
	): calcResult {
		if (
			this.state === undefined ||
			upgrades[0] >= this.state.ns.hacknet.maxNumNodes()
		) {return [NaN, NaN];}
		let cost = 0;
		const gainRate = currentGainRate;
		cost += this.state.calc.hacknetNodes.hacknetNodeCost(
			nodeCount, this.state.player.mults.hacknet_node_purchase_cost,
		);
		cost += this.state.calc.hacknetNodes.hacknetNodeCost(
			nodeCount, this.state.player.mults.hacknet_node_purchase_cost,
		);
		cost += this.state.calc.hacknetNodes.levelUpgradeCost(
			1, upgrades[0], this.state.player.mults.hacknet_node_level_cost,
		);
		cost += this.state.calc.hacknetNodes.ramUpgradeCost(
			1, upgrades[1], this.state.player.mults.hacknet_node_ram_cost,
		);
		cost += this.state.calc.hacknetNodes.coreUpgradeCost(
			1, upgrades[2], this.state.player.mults.hacknet_node_core_cost,
		);
		return [cost, gainRate];
	}
	protected calcNextLevel(
		nodeCount: number,
		upgrades: upgrades,
		currentGainRate: number,
		constants: HacknetNodeConstants,
	): calcResult {
		if (
			this.state === undefined ||
			upgrades[0] >= constants.MaxLevel
		) {return [NaN, NaN];}
		const cost = this.state.calc.hacknetNodes.levelUpgradeCost(
			upgrades[0], upgrades[0]+1, this.state.player.mults.hacknet_node_level_cost,
		);
		const gainRate =
			this.state.calc.hacknetNodes.moneyGainRate(upgrades[0]+1, upgrades[1], upgrades[2]) -
			currentGainRate;
		return [cost*nodeCount, gainRate*nodeCount];
	}
	protected calcNextRam(
		nodeCount: number,
		upgrades: upgrades,
		currentGainRate: number,
		constants: HacknetNodeConstants,
	): calcResult {
		if (
			this.state === undefined ||
			upgrades[0] >= constants.MaxRam
		) {return [NaN, NaN];}
		const cost = this.state.calc.hacknetNodes.ramUpgradeCost(
			upgrades[1], upgrades[1]+1, this.state.player.mults.hacknet_node_ram_cost,
		);
		const gainRate = (
			this.state.calc.hacknetNodes.moneyGainRate(upgrades[0], upgrades[1]*2, upgrades[2]) -
			currentGainRate
		);
		return [cost*nodeCount, gainRate*nodeCount];
	}
	protected calcNextCore(
		nodeCount: number,
		upgrades: upgrades,
		currentGainRate: number,
		constants: HacknetNodeConstants,
	): calcResult {
		if (
			this.state === undefined ||
			upgrades[0] >= constants.MaxCores
		) {return [NaN, NaN];}
		const cost = this.state.calc.hacknetNodes.coreUpgradeCost(
			upgrades[2], upgrades[2]+1, this.state.player.mults.hacknet_node_core_cost,
		);
		const gainRate = (
			this.state.calc.hacknetNodes.moneyGainRate(upgrades[0], upgrades[1], upgrades[2]+1) -
			currentGainRate
		);
		return [cost*nodeCount, gainRate*nodeCount];
	}
}


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

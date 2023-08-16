import {HacknetNodeConstants} from "@ns";
import {bestAction, mainState, masterModule} from "/lib/masterModules/masterModuleTypes";
import {RESPONSES} from "/lib/masterModules/globalResponses";
import {responseData} from "/lib/networking";

interface upgradeTarget {
	name: string;
	count: number;
	cost: number;
	incomePerSec: number;
}
type upgrades = [level: number, ram: number, cores: number];
type hacknetTarget = [nodeCount: number, ...upgrades:upgrades];
type calcResult = [cost: number, gainRate: number];
type upgradeOption = [name: string, calcResult: calcResult];

const BUY_SUBCOMMAND = Object.freeze(["node", "fullNode", "level", "ram", "cores"] as const);

export class hacknet implements masterModule {
	protected name: string|undefined;
	protected state: mainState|undefined;
	protected upgradeChain: upgradeTarget[] = [];
	protected indexInChain = 0;
	protected hacknetTarget: hacknetTarget = [0, 1, 1, 1]; // starting hacknet state
	initalize(name: string, state: mainState): void {
		this.name = name;
		this.state = state;
	}
	requestHandler(_from: string, command: string, args: string[]): responseData {
		let results: responseData;
		if (this.state === undefined) {
			results = RESPONSES.stateUndefined;
			return results;
		}
		switch (command) {
			case "buy" : {
				results = RESPONSES.unknownError;
				const subcommand = args[0];
				if (!isvalidBuySubcommand(subcommand)) {return RESPONSES.invalidArgs;}
				// nodeIndex is either the args or overwritten via the new node
				let nodeIndex = Number(args[1]);
				// node
				if (subcommand === "node" || subcommand === "fullNode") {
					nodeIndex = this.state.ns.hacknet.purchaseNode();
					if (nodeIndex === -1) {
						results = ["failure", "Couldn't purchase node."];
						break;
					}
					results = ["success", `Node ${nodeIndex} purchased.`];
				}
				if (Number.isNaN(nodeIndex)) {
					results = ["failure", "Node index is NaN."];
					break;
				}
				const node = this.state.ns.hacknet.getNodeStats(nodeIndex);
				// level
				if (subcommand === "level" || subcommand === "fullNode") {
					if (!this.state.ns.hacknet.upgradeLevel(
						nodeIndex,
						this.hacknetTarget[1]-node.level,
					)) {
						results = ["failure", "Couldn't purchase levels."];
						break;
					}
					results = ["success", `Node ${nodeIndex}'s level upgraded.`];
				}
				// ram
				if (subcommand === "ram" || subcommand === "fullNode") {
					if (!this.state.ns.hacknet.upgradeRam(
						nodeIndex,
						Math.log2(this.hacknetTarget[2])-Math.log2(node.ram),
					)) {
						results = ["failure", "Couldn't purchase ram."];
						break;
					}
					results = ["success", `Node ${nodeIndex}'s ram upgraded.`];
				}
				// cores
				if (subcommand === "cores" || subcommand === "fullNode") {
					if (!this.state.ns.hacknet.upgradeCore(
						nodeIndex,
						this.hacknetTarget[3]-node.cores,
					)) {
						results = ["failure", "Couldn't purchase cores."];
						break;
					}
					results = ["success", `Node ${nodeIndex}'s cores upgraded.`];
				}
				// fix fullNode's results
				if (subcommand === "fullNode") {
					results = ["success", `Node ${nodeIndex} purchased and upgraded.`];
				}
				break;
			}
			case "recalculate": {
				switch (args[0]) {
					default: {
						this.calculateUpgradeChain(upgradeOption => upgradeOption[1][1]/upgradeOption[1][0]);
					}
				}
				// falls through
			}
			case "recheck": {
				this.indexInChain = 0;
				this.hacknetTarget = [0, 1, 1, 1];
				const recheckResult = this.getBestAction();
				if (recheckResult === undefined) {
					results = ["failure", "Recheck returned undefined."];
					break;
				}
				results = [
					"success",
					`Recheck got to index "${this.indexInChain}". Next step: ${recheckResult.args[0]}`,
				];
				break;
			}
			case "help": {
				// TMP: temp help function
				let commands: string[];
				if (args.length === 0) {
					commands = ["buy", "recalculate", "recheck", "help"];
				} else if (args[0] === "buy") {
					commands = [...BUY_SUBCOMMAND.values()];
				} else {
					commands = ["buy", "recalculate", "recheck", "help"];
				}
				results = ["success", JSON.stringify(commands), ...commands];
				break;
			}
			default: {
				results = RESPONSES.invalidCommand;
			}
		}
		return results;
	}
	getBestAction(): bestAction|undefined {
		if (this.state === undefined) {return;}
		// assumes the hacknet nodes are up to date with upgrade path.
		//   will give incorrect metrics otherwise
		// loop until action is found
		while (true) {
			// reached end of upgrade chain. This is as far as we go
			if (this.upgradeChain.length === this.indexInChain) {
				return;
			}
			const upgradeTarget = this.upgradeChain[this.indexInChain];
			const metrics: bestAction["metrics"] = {
				async: false,
				incomePerSec: upgradeTarget.incomePerSec,
				cost: upgradeTarget.cost,
			};
			// buy next node + upgrades
			if (this.state.ns.hacknet.numNodes() < this.hacknetTarget[0]) {
				return {
					command: "buy",
					args: ["fullNode"],
					metrics: metrics,
				};
			}
			// check each node in reverse order for needed upgrades
			for (let i=this.state.ns.hacknet.numNodes()-1; i>=0; i--) {
				const node = this.state.ns.hacknet.getNodeStats(i);
				if (node.level < this.hacknetTarget[1]) {
					return {command: "buy", args: ["level", i.toString()], metrics: metrics};
				}
				if (node.ram < this.hacknetTarget[2]) {
					return {command: "buy", args: ["ram", i.toString()], metrics: metrics};
				}
				if (node.cores < this.hacknetTarget[3]) {
					return {command: "buy", args: ["cores", i.toString()], metrics: metrics};
				}
			}
			this.indexInChain++;
		}
	}

	/* upgrade chain generation */
	protected calculateUpgradeChain(valueMetric: (upgradeOption: [string, calcResult]) => number): void {
		if (this.state === undefined) {return;}
		// always start with first node purchase
		const upgradePath: upgradeTarget[] = [];
		const upgrades: upgrades = [1, 1, 1];
		const currentGainRate = this.state.calc.hacknetNodes.moneyGainRate(...upgrades);
		const upgradeOptions: [string, calcResult][] = [];
		const hacknetConstants: HacknetNodeConstants = this.state.calc.hacknetNodes.constants();
		let nodeCount = 0;
		// generate upgrade chain
		while (true) {
			upgradeOptions.push([
				"node",
				this.calcNewNode(nodeCount, upgrades, currentGainRate, hacknetConstants),
			]);
			upgradeOptions.push([
				"level",
				this.calcNextLevel(nodeCount, upgrades, currentGainRate, hacknetConstants),
			]);
			upgradeOptions.push([
				"ram",
				this.calcNextRam(nodeCount, upgrades, currentGainRate, hacknetConstants),
			]);
			upgradeOptions.push([
				"core",
				this.calcNextCore(nodeCount, upgrades, currentGainRate, hacknetConstants),
			]);
			upgradeOptions.sort((a, b): number=>valueMetric(a)-valueMetric(b));
			// apply to path and get ready for next loop
			if (Number.isNaN(upgradeOptions[0][1][0]) || Number.isNaN(upgradeOptions[0][1][1])) {
				break;
			}
			if (upgradeOptions[0][0] === "node") {nodeCount++;}
			this.addUpgradeToPath(upgradePath, upgradeOptions[0]);
			upgradeOptions.length = 0;
		}
	}
	protected addUpgradeToPath(upgradePath: upgradeTarget[], upgradeOption: upgradeOption): void {
		const lastUpgrade = upgradePath[upgradePath.length-1];
		if (lastUpgrade.name !== upgradeOption[0]) {
			upgradePath.push({
				name: upgradeOption[0],
				count: 1,
				cost: upgradeOption[1][0],
				incomePerSec: upgradeOption[1][1],
			});
			return;
		}
		lastUpgrade.count++;
	}
	/* calculations */
	protected calcNewNode(
		nodeCount: number,
		upgrades: upgrades,
		currentGainRate: number,
		_hacknetConstants: HacknetNodeConstants,
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
		hacknetConstants: HacknetNodeConstants,
	): calcResult {
		if (
			this.state === undefined ||
			upgrades[0] >= hacknetConstants.MaxLevel
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
		hacknetConstants: HacknetNodeConstants,
	): calcResult {
		if (
			this.state === undefined ||
			upgrades[0] >= hacknetConstants.MaxRam
		) {return [NaN, NaN];}
		const cost = this.state.calc.hacknetNodes.ramUpgradeCost(
			upgrades[1], upgrades[1]+1, this.state.player.mults.hacknet_node_ram_cost,
		);
		const gainRate =
			this.state.calc.hacknetNodes.moneyGainRate(upgrades[0], upgrades[1]*2, upgrades[2]) -
			currentGainRate;
		return [cost*nodeCount, gainRate*nodeCount];
	}
	protected calcNextCore(
		nodeCount: number,
		upgrades: upgrades,
		currentGainRate: number,
		hacknetConstants: HacknetNodeConstants,
	): calcResult {
		if (
			this.state === undefined ||
			upgrades[0] >= hacknetConstants.MaxCores
		) {return [NaN, NaN];}
		const cost = this.state.calc.hacknetNodes.coreUpgradeCost(
			upgrades[2], upgrades[2]+1, this.state.player.mults.hacknet_node_core_cost,
		);
		const gainRate =
			this.state.calc.hacknetNodes.moneyGainRate(upgrades[0], upgrades[1], upgrades[2]+1) -
			currentGainRate;
		return [cost*nodeCount, gainRate*nodeCount];
	}
}


// UTILS

function isvalidBuySubcommand(subcommand: string): subcommand is typeof BUY_SUBCOMMAND[number] {
	if (BUY_SUBCOMMAND.includes(subcommand as typeof BUY_SUBCOMMAND[number])) {return true;}
	return false;
}

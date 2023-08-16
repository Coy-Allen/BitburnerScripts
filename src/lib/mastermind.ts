import {NS, Formulas, SourceFileLvl} from "@ns";
import {masterModule, mainState, bestAction} from "/lib/masterModules/masterModuleTypes";
import {RESPONSES} from "/lib/masterModules/globalResponses";
import {networking, request, responseData} from "/lib/networking";
import {scanning} from "/lib/scanning";

export type commands = Map<
	string,
	((request: request, servers: scanning) => responseData)|undefined
>;
// undefined entries should be removed as soon as posible
type actionEntry = [string, bestAction];
type actionEntryDirty = [string, bestAction|undefined];

export class mastermind {
	state: mainState;
	masterModules: Map<string, masterModule>;
	constructor(
		ns: NS,
		calc: Formulas,
		_sourceFiles: SourceFileLvl[],
		masterModules: Map<string, masterModule>,
	) {
		this.state = {
			ns: ns,
			nic: new networking(ns, "remoteMaster"),
			scanning: new scanning(ns),
			player: ns.getPlayer(),
			calc: calc,
		};
		this.state.nic.clearPorts();
		this.masterModules = masterModules;
		for (const [targetName, targetModule] of masterModules) {
			targetModule.initalize(targetName, this.state);
		}
	}
	processAllRequests(): void {
		const requests = this.state.nic.receiveRequests();
		const currentResponseState = this.state.nic.grabResponseState();
		for (const nextRequest of requests) {
			let fulfilledRequest: responseData;
			const fromNicId = nextRequest[0];
			const requestData = nextRequest[2];
			const targetModule = this.masterModules.get(requestData[0]);
			if (targetModule === undefined) {
				fulfilledRequest = RESPONSES.moduleNotFound;
				continue;
			}
			fulfilledRequest = targetModule.requestHandler(fromNicId, requestData[1], requestData[2]);
			currentResponseState.set(fromNicId, [nextRequest[1], fulfilledRequest]);
		}
		// don't send responses to no-reply
		currentResponseState.delete("no-reply");
		// send responses
		this.state.nic.writeRawResponses(currentResponseState);
	}
	* queueNextAction(
		sortingFunc: (a: actionEntry, b: actionEntry) => number, // sort decending
	): Generator<request, never, never> {
		// initialize actions
		const actions = [...this.masterModules.keys()]
			.map((key): actionEntryDirty=>[key, this.masterModules.get(key)?.getBestAction()])
			.filter(entry=>entry[1]!==undefined) as actionEntry[]; // remove undefined
		let nextBestAction: actionEntry;
		while (true) {
			// sort actions
			actions.sort(sortingFunc); // I would kill for a Heap
			nextBestAction = actions[0];
			// put best action into queue
			yield ["no-reply", 0, [nextBestAction[0], nextBestAction[1].command, nextBestAction[1].args]];
			// always refresh action after yielding
			nextBestAction[1].ttl = 0;
			// refresh needed actions and remove undefined actions
			actions.filter(action=>{
				if (action[1].ttl === undefined) {return true;}
				if (action[1].ttl > 0) {
					action[1].ttl--;
					return true;
				}
				const newAction = this.masterModules.get(action[0])?.getBestAction();
				if (newAction === undefined) {return false;}
				action[1] = newAction;
				return true;
			});

		}
	}
	async run(ms=100): Promise<void> {
		this.state.ns.tprint("running");
		const actionQueuer = this.queueNextAction(sortFastestBuyback); // FIXME: find good sorting func
		while (true) {
			await this.state.ns.sleep(ms);
			this.state.scanning.updateAll();
			this.state.player = this.state.ns.getPlayer();
			actionQueuer.next(); // put best action into queue
			this.processAllRequests();
		}
	}
}

/* Next action sorter */

function sortFastestBuyback(a: actionEntry, b: actionEntry): number {
	const buybackTimeA = a[1].metrics.cost/a[1].metrics.incomePerSec;
	const buybackTimeB = b[1].metrics.cost/b[1].metrics.incomePerSec;
	return buybackTimeB - buybackTimeA; // decending
}

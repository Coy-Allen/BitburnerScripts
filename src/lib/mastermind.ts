import {NS, Formulas, SourceFileLvl} from "@ns";
import {masterModule, mainState} from "/lib/masterModules/masterModuleTypes";
import {networking, request, responseData} from "/lib/networking";
import {scanning} from "/lib/scanning";

export type commands = Map<
	string,
	((request: request, servers: scanning) => responseData)|undefined
>;

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
		ns.clearPort(networking.requestPort);
		ns.clearPort(networking.responsePort);
		this.masterModules = masterModules;
		for (const [targetName, targetModule] of masterModules) {
			targetModule.initalize(targetName, this.state);
		}
	}
	processAllRequests(_step: number): void {
		const requests = this.state.nic.receiveRequests();
		const currentResponseState = this.state.nic.grabResponseState();
		for (const nextRequest of requests) {
			let fulfilledRequest: responseData;
			const fromNicId = nextRequest[0];
			const requestData = nextRequest[2];
			const targetModule = this.masterModules.get(requestData[0]);
			if (targetModule === undefined) {
				fulfilledRequest = ["moduleNotFound", `The requested module "${requestData[0]}" was not found.`];
				continue;
			}
			fulfilledRequest = targetModule.requestHandler(fromNicId, requestData[1], requestData[2]);
			currentResponseState.set(nextRequest[0], [nextRequest[1], fulfilledRequest]);
		}
		this.state.nic.writeRawResponses(currentResponseState);
	}
	queueNextAction(_step: number): void {
		// TODO: stub
		return;
	}
	async run(ms=100): Promise<void> {
		let i = 0;
		this.state.ns.tprint("running");
		while (true) {
			await this.state.ns.sleep(ms);
			this.state.scanning.updateAll();
			this.state.player = this.state.ns.getPlayer();
			this.queueNextAction(i);
			this.processAllRequests(i);
			i++;
		}
	}
}

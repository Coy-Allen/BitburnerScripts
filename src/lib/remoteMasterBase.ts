import {NS, Formulas, Player} from "@ns";
import {autoHack} from "/lib/autoHack";
import {scanning} from "/lib/scanning";
import {scriptManager} from "/lib/scriptManager";
import {networking, request, requestCommand, responseData} from "/lib/networking";
import {commandHandler} from "/lib/commandHandler";
import {checkHacknetNodes} from "/lib/autoHacknet";

export type commands = Map<requestCommand, ((request: request, servers: scanning) => responseData)|undefined>;

export class remoteMasterBase {
	ns: NS;
	player: Player;
	nic: networking;
	calc: Formulas;
	scanning: scanning;
	commandHandlerRef: commandHandler;
	constructor(ns: NS, calc: Formulas) {
		this.ns = ns;
		this.nic = new networking(ns, "remoteMaster");
		this.ns.clearPort(networking.requestPort);
		this.ns.clearPort(networking.responsePort);
		this.scanning = new scanning(ns);
		this.player = this.ns.getPlayer();
		this.calc = calc;
		this.commandHandlerRef = new commandHandler(ns, calc, this.scanning);
	}
	processAllRequests(): void {
		const requests = this.nic.receiveRequests();
		const currentResponseState = this.nic.grabResponseState();
		for (const nextRequest of requests) {
			if (nextRequest[2][0]==="") {
				currentResponseState.delete(nextRequest[0]);
				continue;
			}
			const fulfilledRequest = this.processRequest(nextRequest);
			currentResponseState.set(nextRequest[0], [nextRequest[1], fulfilledRequest]);
		}
		this.nic.writeRawResponses(currentResponseState);
	}
	processRequest(requestToProcess: request): responseData {
		const targetFunc = this.commandHandlerRef.commandList.get(requestToProcess[2][0]);
		if (targetFunc === undefined) {
			this.ns.tprint(`remoteMaster: undefined command ${requestToProcess.toString()}`);
			return [];
		}
		const result = targetFunc(requestToProcess, this.scanning);
		return result;
	}
	async run(ms=100): Promise<void> {
		const autoHackObj = new autoHack(this.ns);
		const scriptManagerObj = new scriptManager(this.ns, this.scanning);
		let i = 0;
		this.ns.tprint("remoteMaster: running");
		while (true) {
			await this.ns.sleep(ms);
			this.scanning.updateAll();
			this.player = this.ns.getPlayer();
			this.processAllRequests();
			if (i%100===0) {
				const servers = this.scanning.updateAll();
				autoHackObj.checkTools();
				const autoHackCounters = autoHackObj.tryAll(servers, this.player);
				const targets = i===0 ? autoHackCounters.admin[0].concat(autoHackCounters.admin[1]) : autoHackCounters.admin[1];
				scriptManagerObj.runScriptOnHosts("/exec/remoteClientDynamic.js", targets);
				autoHackCounters.backdoor[1].forEach((hostname)=>{
					this.ns.tprint(`backdoor avaliable for ${hostname}.`);
					this.ns.tprint(this.scanning.pathToServer(hostname, true).reverse().map(name=>`connect ${name};`).join("")+"backdoor;");
				});
				await checkHacknetNodes(this.ns, this.calc);
			}
			i++;
		}
	}
}

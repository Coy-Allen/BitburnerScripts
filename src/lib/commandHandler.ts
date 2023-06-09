import {NS, Formulas, Server, ProcessInfo} from "@ns";
import {commands} from "/lib/remoteMasterBase";
import {request, responseData} from "/lib/networking";
import {scanning} from "./scanning";

export class commandHandler {
	ns: NS;
	formulas: Formulas;
	scanningRef: scanning;
	commandList: commands = new Map();
	constructor(ns: NS, formulas: Formulas, scanningRef: scanning) {
		this.ns = ns;
		this.formulas = formulas;
		this.scanningRef = scanningRef;
		this.generateCommands();
	}
	generateCommands(): void {
		this.commandList.set("", undefined);
		// Priority: returns which function the client should run ["hack"|"grow"|"weaken", TARGET]
		this.commandList.set("priority", (givenRequest: request): responseData => {
			const requestInfo = this.getRequestInfo(givenRequest);
			const attackingServer = this.scanningRef.getServer(requestInfo[0]);
			const targetServer = this.getTarget(requestInfo[1], attackingServer, this.scanningRef);
			const func = this.getClientFunc(requestInfo[1], attackingServer, targetServer, this.scanningRef);
			return [func, targetServer.hostname];
		});
		// getTarget: returns which target the client should target
		this.commandList.set("getTarget", (givenRequest: request): responseData => {
			const requestInfo = this.getRequestInfo(givenRequest);
			const attackingServer = this.scanningRef.getServer(requestInfo[0]);
			return [this.getTarget(requestInfo[1], attackingServer, this.scanningRef).hostname];
		});
	}
	getRequestInfo(givenRequest: request): [string, ProcessInfo] {
		const [hostname, pid] = givenRequest[0].split("|");
		const clientProcess = this.ns.ps(hostname).find(process=>process.pid===Number(pid));
		if (clientProcess === undefined) {throw new Error();} // FIXME: error handling on undefined process
		return [hostname, clientProcess];
	}
	getClientFunc(clientProcess: ProcessInfo, _attackingServer: Server, targetServer: Server, _scanningRef: scanning): string {
		const securityDiff = targetServer.hackDifficulty - targetServer.minDifficulty;
		if (securityDiff > 0.05*clientProcess.threads || targetServer.hackDifficulty >= 99.95) {return "weaken";}
		const growPercentPossible = this.formulas.hacking.growPercent(
			targetServer,
			clientProcess.threads,
			this.ns.getPlayer(),
		);
		const growPercentNeeded = targetServer.moneyMax / targetServer.moneyAvailable - 1;
		if (growPercentPossible <= growPercentNeeded || targetServer.moneyAvailable <= 100) {return "grow";}
		return "hack";
	}
	getTarget(_clientProcess: ProcessInfo, _attackingServer: Server, scanningRef: scanning): Server {
		const player = this.ns.getPlayer();
		const rankedTargets = [...scanningRef.updateAll()]
			.filter((server): boolean=>{
				if (
					server.hostname === "n00dles" || // somehow always gets top spot but shouldn't
					!server.hasAdminRights ||
					server.purchasedByPlayer ||
					server.requiredHackingSkill > player.skills.hacking ||
					server.moneyMax === 0
				) {return false;}
				return true;
			})
			.map((server)=>{
				const serverCopy = JSON.parse(JSON.stringify(server)) as Server;
				serverCopy.hackDifficulty = serverCopy.minDifficulty;
				const estimatePerHack = this.formulas.hacking.hackChance(serverCopy, player)*serverCopy.moneyMax;
				const hacktime = Math.max(10, this.formulas.hacking.hackTime(serverCopy, player));
				const value = estimatePerHack/hacktime;
				return [value, server] as [number, Server];
			})
			.sort((a, b)=>{
				return a[0]-b[0];
			});
		return rankedTargets[0][1];
	}
}

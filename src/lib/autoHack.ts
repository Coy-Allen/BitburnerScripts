import {NS, Player, Server} from "@ns";

type counters = [string[], string[], string[]];

export class autoHack {
	ns: NS;
	aquiredTools = {
		ssh: false,
		ftp: false,
		sntp: false,
		http: false,
		sql: false,
	};
	constructor(ns: NS) {
		this.ns = ns;
		this.checkTools();
	}
	checkTools(): boolean {
		const countBefore = this.validToolCount();
		this.aquiredTools.ssh=this.ns.fileExists("BruteSSH.exe");
		this.aquiredTools.ftp=this.ns.fileExists("FTPCrack.exe");
		this.aquiredTools.sntp=this.ns.fileExists("relaySMTP.exe");
		this.aquiredTools.http=this.ns.fileExists("HTTPWorm.exe");
		this.aquiredTools.sql=this.ns.fileExists("SQLInject.exe");
		return countBefore !== this.validToolCount();
	}
	validToolCount(): number {
		return Object.values(this.aquiredTools).filter(Boolean).length;
	}
	/**
	 * @returns
	 * Two 3 length array showing [already nuked, successfully nuked, unable to nuke]
	 */
	tryAll(servers: Server[], player: Player): Record<"admin"|"backdoor", counters> {
		const counters: Record<"admin"|"backdoor", counters> = {
			admin: [[], [], []],
			backdoor: [[], [], []],
		};
		servers.map(server => {
			counters.admin[this.openAndNuke(server)+1].push(server.hostname);
			counters.backdoor[this.backdoor(server, player)+1].push(server.hostname);
		});
		return counters;
	}
	/**
	 * @returns
	 * -1 on no action required, 0 on success, 1 on failure
	 */
	openAndNuke(server: Server): -1|0|1 {
		if (server.hasAdminRights) {return -1;}
		if (this.validToolCount() < server.numOpenPortsRequired) {return 1;}
		if (this.ns.fileExists("BruteSSH.exe")) {this.ns.brutessh(server.hostname);}
		if (this.ns.fileExists("FTPCrack.exe")) {this.ns.ftpcrack(server.hostname);}
		if (this.ns.fileExists("relaySMTP.exe")) {this.ns.relaysmtp(server.hostname);}
		if (this.ns.fileExists("HTTPWorm.exe")) {this.ns.httpworm(server.hostname);}
		if (this.ns.fileExists("SQLInject.exe")) {this.ns.sqlinject(server.hostname);}
		this.ns.nuke(server.hostname);
		return 0;
	}
	backdoor(server: Server, player: Player): -1|0|1 {
		if (server.backdoorInstalled || server.purchasedByPlayer) {return -1;}
		if (!server.hasAdminRights || server.requiredHackingSkill > player.skills.hacking) {return 1;}
		// TODO: source file 4 handling
		return 0;
	}
}

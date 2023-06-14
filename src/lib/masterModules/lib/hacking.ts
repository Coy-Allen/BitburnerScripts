import {Server} from "@ns";
import {mainState} from "/lib/CommandHandlerTypes";

export class hackingBase {
	name: string|undefined;
	state: mainState|undefined;
	aquiredTools = {
		ssh: false,
		ftp: false,
		sntp: false,
		http: false,
		sql: false,
	};
	initalize(name: string, state: mainState): void {
		this.name = name;
		this.state = state;
	}
	checkTools(): boolean {
		if (this.state === undefined) {return false;}
		const countBefore = this.validToolCount();
		this.aquiredTools.ssh=this.state.ns.fileExists("BruteSSH.exe");
		this.aquiredTools.ftp=this.state.ns.fileExists("FTPCrack.exe");
		this.aquiredTools.sntp=this.state.ns.fileExists("relaySMTP.exe");
		this.aquiredTools.http=this.state.ns.fileExists("HTTPWorm.exe");
		this.aquiredTools.sql=this.state.ns.fileExists("SQLInject.exe");
		return countBefore !== this.validToolCount();
	}
	validToolCount(): number {
		return Object.values(this.aquiredTools).filter(Boolean).length;
	}
	/**
	 * @returns
	 * -1 on no action required, 0 on success, 1 on failure
	 */
	openAndNuke(server: Server): -1|0|1 {
		if (this.state === undefined) {return 1;}
		if (server.hasAdminRights) {return -1;}
		if (this.validToolCount() < server.numOpenPortsRequired) {return 1;}
		if (this.state.ns.fileExists("BruteSSH.exe")) {this.state.ns.brutessh(server.hostname);}
		if (this.state.ns.fileExists("FTPCrack.exe")) {this.state.ns.ftpcrack(server.hostname);}
		if (this.state.ns.fileExists("relaySMTP.exe")) {this.state.ns.relaysmtp(server.hostname);}
		if (this.state.ns.fileExists("HTTPWorm.exe")) {this.state.ns.httpworm(server.hostname);}
		if (this.state.ns.fileExists("SQLInject.exe")) {this.state.ns.sqlinject(server.hostname);}
		this.state.ns.nuke(server.hostname);
		return 0;
	}
}

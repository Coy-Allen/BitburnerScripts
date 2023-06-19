import {Player, Server} from "@ns";
import {getBestAction, mainState, masterModule} from "/lib/masterModules/masterModuleTypes";
import {responseData} from "/lib/networking";

export abstract class hackingBase implements masterModule {
	protected name: string|undefined;
	protected state: mainState|undefined;
	protected aquiredTools = {
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
	async requestHandler(_from: string, command: string, args: string[]): Promise<responseData> {
		let results: responseData = ["resultUndefined", "Result was returned without assignment."];
		if (this.state === undefined) {
			results = ["stateUndefined", "State is not defined at call time."];
			return Promise.resolve(results);
		}
		const servers = this.state.scanning.getServers();
		switch (command) {
			case "backdoor": {
				switch (args[0]) {
					case "all": {
						const backdoorResults: [string, (-1|0|1)][] = [];
						for (const [serverName, serverData] of servers) {
							backdoorResults.push([serverName, await this.backdoor(serverData, this.state.player)]);
						}
						results = [
							"allGlob",
							"Backdoor results: \n"+
								backdoorResults.map(([hostname, result]): string=>`${hostname}: ${result}`).join("\n"),
							JSON.stringify(backdoorResults),
						];
						break;
					}
					default: { // try specific sever
						try {
							const path = this.state.scanning.pathToServer(args[0]);
							const server = this.state.scanning.getServer(args[0]);
							switch (await this.backdoor([path, server], this.state.player)) {
								case 0: {
									results = ["success", `Backdoor successfully ran on "${args[0]}".`, "0"];
									break;
								}
								case 1: {
									results = ["failure", `Backdoor failed to run on "${args[0]}".`, "1"];
									break;
								}
								case -1: {
									results = ["success", `Backdoor already installed on "${args[0]}".`, "-1"];
									break;
								}
							}
						} catch {
							results = ["serverNotFound", `Could not find server "${args[0]}".`];
						}
					}
				}
				break;
			}
			default: {
				results = ["invalidCommand", `Invalid command ${command}.`];
			}
		}
		return Promise.resolve(results);
	}
	async getBestAction(): Promise<getBestAction|undefined> {
		if (this.state === undefined) {return Promise.resolve(undefined);}
		const servers = this.state.scanning.getServers();
		for (const [, [, server]] of servers) {
			// always hack
			this.openAndNuke(server);
		}
		return this.getBestBackdoorAction();
	}
	stepRunner(): void {return;} // Not used
	protected checkTools(): boolean {
		if (this.state === undefined) {return false;}
		const countBefore = this.validToolCount();
		this.aquiredTools.ssh=this.state.ns.fileExists("BruteSSH.exe");
		this.aquiredTools.ftp=this.state.ns.fileExists("FTPCrack.exe");
		this.aquiredTools.sntp=this.state.ns.fileExists("relaySMTP.exe");
		this.aquiredTools.http=this.state.ns.fileExists("HTTPWorm.exe");
		this.aquiredTools.sql=this.state.ns.fileExists("SQLInject.exe");
		return countBefore !== this.validToolCount();
	}
	protected validToolCount(): number {
		return Object.values(this.aquiredTools).filter(Boolean).length;
	}
	/**
	 * @returns
	 * -1 on no action required, 0 on success, 1 on failure
	 */
	protected openAndNuke(server: Server): -1|0|1 {
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
	/**
	 * @returns
	 * -1 on no action required, 0 on success, 1 on failure
	 */
	protected abstract backdoor(serverData: [string[], Server], player: Player): Promise<0 | 1 | -1>;
	protected abstract getBestBackdoorAction(): Promise<getBestAction|undefined>;
}

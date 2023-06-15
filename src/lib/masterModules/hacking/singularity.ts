import {Player, Server} from "@ns";
import {masterModule, getBestAction} from "/lib/masterModules/masterModuleTypes";
import {hackingBase} from "lib/masterModules/lib/Hacking";

export class hacking extends hackingBase implements masterModule {
	/**
	 * @returns
	 * -1 on no action required, 0 on success, 1 on failure
	 */
	protected async backdoor(serverData: [string[], Server], player: Player): Promise<0|1|-1> {
		if (this.state === undefined) {return 1;}
		const [path, server] = serverData;
		if (server.backdoorInstalled || server.purchasedByPlayer) {return -1;}
		if (!server.hasAdminRights || server.requiredHackingSkill > player.skills.hacking) {return 1;}
		for (const host of path.reverse()) {
			const didConnect = this.state.ns.singularity.connect(host);
			if (!didConnect) {return 1;}
		}
		await this.state.ns.singularity.installBackdoor();
		return 0;
	}
	protected getBestBackdoorAction(): Promise<getBestAction|undefined> {
		if (this.state === undefined) {return Promise.resolve(undefined);}
		const servers = this.state.scanning.getServers();
		let targetServer: [string, number] = ["", Number.MAX_SAFE_INTEGER];
		for (const [, [, server]] of servers) {
			const timeToBackdoor = this.state.calc.hacking.hackTime(server, this.state.player) / 4 * 1000;
			if (targetServer[1] > timeToBackdoor) {
				targetServer = [server.hostname, timeToBackdoor];
			}
		}
		return Promise.resolve({
			command: "backdoor",
			args: [targetServer[0]],
			priority: 0,
			metrics: {
				timeInvestment: targetServer[1],
				payout: 0,
				incomePerSec: 0,
			},
		});
	}
}

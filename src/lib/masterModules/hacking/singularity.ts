import {Player, Server} from "@ns";
import {masterModule, bestAction} from "/lib/masterModules/masterModuleTypes";
import {hackingBase} from "lib/masterModules/lib/hacking";

export class hacking extends hackingBase implements masterModule {
	/**
	 * @returns
	 * -1 on no action required, 0 on success, 1 on failure
	 */
	protected backdoor(serverData: [string[], Server], player: Player): 0|1|-1 {
		if (this.state === undefined) {return 1;}
		const [path, server] = serverData;
		if (server.backdoorInstalled || server.purchasedByPlayer) {return -1;}
		if (!server.hasAdminRights || server.requiredHackingSkill > player.skills.hacking) {return 1;}
		for (const host of path.reverse()) {
			const didConnect = this.state.ns.singularity.connect(host);
			if (!didConnect) {return 1;}
		}
		// FIXME: pass off execution to async handler
		// await this.state.ns.singularity.installBackdoor();
		return 0;
	}
	protected getBestBackdoorAction(): bestAction|undefined {
		if (this.state === undefined) {return;}
		const servers = this.state.scanning.getServers();
		let targetServer: [string, number] = ["", Number.MAX_SAFE_INTEGER];
		for (const [, [, server]] of servers) {
			const timeToBackdoor = this.state.calc.hacking.hackTime(server, this.state.player) / 4 * 1000;
			if (targetServer[1] > timeToBackdoor) {
				targetServer = [server.hostname, timeToBackdoor];
			}
		}
		// TODO: find async metrics
		return {
			command: "backdoor",
			args: [targetServer[0]],
			metrics: {
				async: {
					ram: 0,
					time: 0,
				},
				cost: 0,
				incomePerSec: 0,
			},
		};
	}
}

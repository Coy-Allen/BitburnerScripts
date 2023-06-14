import {Player, Server} from "@ns";
import {requestArgs, responseData} from "/lib/networking";
import {masterModule, mainState} from "/lib/CommandHandlerTypes";
import {hackingBase} from "lib/masterModules/lib/Hacking";

export class hacking extends hackingBase implements masterModule {
	initalize(name: string, state: mainState): void {
		this.name = name;
		this.state = state;
		// TODO: stub
	}
	requestHandler(from: string, command: string, args: requestArgs): Promise<responseData> {
		const results: string[] = [];
		return Promise.resolve(results);
		// TODO: stub
	}
	processAction(_action: string[]): Promise<string[]> {
		if (this.state === undefined) {return Promise.resolve([]);}
		const results: string[] = [];
		const servers = this.state.scanning.getServers();
		// TODO: implement different actions
		for (const [, [, server]] of servers) {
			this.openAndNuke(server);
			this.backdoor(server, this.state.player);
		}
		return Promise.resolve(results);
	}
	async getBestAction(): Promise<string[]> {
		return Promise.resolve(["all"]);
	}
	stepRunner(): void {return;} // Not used
	/**
	 * @returns
	 * -1 on no action required, 0 on success, 1 on failure
	 */
	backdoor(server: Server, player: Player): -1|0|1 {
		if (this.state) {return 1;}
		if (server.backdoorInstalled || server.purchasedByPlayer) {return -1;}
		if (!server.hasAdminRights || server.requiredHackingSkill > player.skills.hacking) {return 1;}
		// Do nothing. we will print the result back in the process action function
		return 0;
	}
}

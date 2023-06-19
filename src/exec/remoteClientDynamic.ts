import {NS} from "@ns";
import {remoteChildBase} from "/lib/remoteClientBase";
import {networking} from "/lib/networking";

export async function main(nsGiven: NS): Promise<void> {
	nsGiven.disableLog("sleep");
	const base = new remoteChildBase(
		nsGiven,
		async(ns: NS, nic: networking, _target: string): Promise<void> => {
			const [givenMethod, target] = await nic.request(["hacking", "priority", []]) as ["hack"|"grow"|"weaken", string];
			switch (givenMethod) {
				case "grow":
					await ns.grow(target);
					break;
				case "hack":
					await ns.hack(target);
					break;
				case "weaken":
					await ns.weaken(target);
					break;
			}
		},
	);
	await base.start();
}

import {NS} from "@ns";
import {remoteChildBase} from "/lib/remoteClientBase";
import {networking} from "/lib/networking";

export async function main(nsGiven: NS): Promise<void> {
	nsGiven.disableLog("sleep");
	const base = new remoteChildBase(
		nsGiven,
		async(ns: NS, _nic: networking, target: string): Promise<void> => {
			await ns.hack(target);
		},
	);
	await base.start();
}

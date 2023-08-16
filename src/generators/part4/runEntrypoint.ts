import {NS} from "@ns";

export function main(ns: NS): void {
	// cold start finished. Continue with a hot start.
	ns.spawn("/exec/mastermindHotStart.js");
}

import {NS} from "@ns";

export function main(ns: NS): void {
	const thisHost = ns.getHostname();
	const maxRam = ns.getServerMaxRam(thisHost);
	const bestScriptChain = [];
	for (let i=1;i<=3;i++) {
		bestScriptChain.push(getBestScript(ns, thisHost, `/generators/part${i}/`, maxRam));
	}
	ns.tprint(`found script chain: ${JSON.stringify(bestScriptChain)}`);
	const nextScript = bestScriptChain.shift();
	if (nextScript !== undefined) {ns.spawn(nextScript, 1, ...bestScriptChain);}
}

function getBestScript(ns: NS, hostname: string, folder: string, maxRam: number): string {
	let [result, targetRam] = ["", 0];
	const targetList = ns.ls(hostname, folder);
	for (const possibleTarget of targetList) {
		const consumedRam = ns.getScriptRam(possibleTarget, hostname);
		if (consumedRam<maxRam && targetRam<consumedRam) {
			result = possibleTarget;
			targetRam = consumedRam;
		}
	}
	return result;
}

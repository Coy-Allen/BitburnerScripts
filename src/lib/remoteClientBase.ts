import {NS} from "@ns";
import {networking} from "/lib/networking";

type priorityFunction = (ns: NS, nic: networking, target: string) => Promise<void>;
export class remoteChildBase {
	nic: networking;
	ns: NS;
	name: string;
	givenPriorityFunction: priorityFunction;
	constructor(ns: NS, priorityFunction: priorityFunction) {
		this.ns = ns;
		this.givenPriorityFunction = priorityFunction;
		const name = this.ns.args.shift()?.toString();
		if (name === undefined) {throw new Error("No args given. specify hostName.");}
		this.name = name;
		this.nic = new networking(this.ns, this.name);
	}
	async start(): Promise<void> {
		let [target] = await this.nic.request(["getTarget"]);
		let i=0;
		while (true) {
			await this.givenPriorityFunction(this.ns, this.nic, target);
			if (i%10===0) {[target] = await this.nic.request(["getTarget"]);}
			i++;
			i%=1000;
		}
	}
}

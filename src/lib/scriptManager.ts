import {NS} from "@ns";
import {scanning} from "/lib/scanning";
import {cartesian} from "/lib/utils";

interface scriptMetadata {
	requirements: string[];
	args?: (hostName: string) => [number, ...string[]];
}

export class scriptManager {
	/* eslint-disable @typescript-eslint/naming-convention */
	scriptFileRequirements: Record<string, scriptMetadata|undefined> = {
		"/exec/remoteClientDynamic.js": {
			requirements: ["/lib/remoteClientBase.js"],
			args: (hostname)=>{
				const threads = this.calcMaxThreads("/exec/remoteClientDynamic.js", hostname);
				return [threads, hostname];
			},
		},
		"/exec/remoteClientGrow.js": {
			requirements: ["/lib/remoteClientBase.js"],
			args: (hostname)=>{
				const threads = this.calcMaxThreads("/exec/remoteClientGrow.js", hostname);
				return [threads, hostname];
			},
		},
		"/exec/remoteClientHack.js": {
			requirements: ["/lib/remoteClientBase.js"],
			args: (hostname)=>{
				const threads = this.calcMaxThreads("/exec/remoteClientHack.js", hostname);
				return [threads, hostname];
			},
		},
		"/exec/remoteClientWeaken.js": {
			requirements: ["/lib/remoteClientBase.js"],
			args: (hostname)=>{
				const threads = this.calcMaxThreads("/exec/remoteClientWeaken.js", hostname);
				return [threads, hostname];
			},
		},
		"/lib/remoteClientBase.js": {
			requirements: ["/lib/networking.js"],
		},
		"/lib/networking.js": {
			requirements: [],
		},
	/* eslint-enable @typescript-eslint/naming-convention */
	};
	ns: NS;
	scanner: scanning;
	constructor(ns: NS, scanner: scanning) {
		this.ns = ns;
		this.scanner = scanner;
	}
	calcMaxThreads(script: string, hostname: string): number {
		const host = this.scanner.getServer(hostname);
		const scriptRam = this.ns.getScriptRam(script, hostname);
		const hostAvaliableRam = host.maxRam-host.ramUsed;
		return Math.max(1, Math.floor(hostAvaliableRam/scriptRam));
	}
	grabAllScriptRequirements(script: string): string[] {
		const requirementsToCheck = [script];
		const requirements: Record<string, boolean> = {};
		while (requirementsToCheck.length !== 0) {
			const toCheck = requirementsToCheck.pop();
			if (toCheck === undefined) {break;}
			if (requirements[toCheck]) {continue;}
			requirements[toCheck] = true;
			const lookup = this.scriptFileRequirements[toCheck]?.requirements;
			if (lookup === undefined) {
				this.ns.tprint(`scriptManager: Requirements unknown for script ${script}.`);
				this.ns.tprint(`scriptManager: ${toCheck} not found in${Object.keys(this.scriptFileRequirements).toString()}.`);
				throw new Error(`scriptManager: Requirements unknown for script ${script}.`);
			}
			requirementsToCheck.push(...lookup);
		}
		return Object.keys(requirements);
	}
	copyFiles(files: string[], hosts: string[]): boolean[] {
		return hosts.map(host=>this.ns.scp(files, host, "home"));
	}
	exec(scripts: string[], hosts: string[]): number[] {
		const args = cartesian(scripts, hosts) as [string, string][];
		return args.map(([script, host]): number=>{
			let scriptArgs: [number, ...string[]] = [1];
			const scriptMetadata = this.scriptFileRequirements[script];
			if (scriptMetadata?.args !== undefined) {
				scriptArgs = scriptMetadata.args(host);
			}
			return this.ns.exec(script, host, ...scriptArgs);
		}); // FIXME
	}
	scriptKill(scripts: string[], hosts: string[]): void {
		const args = cartesian(scripts, hosts) as [string, string][];
		args.map(([script, host]): boolean=>this.ns.scriptKill(script, host));
	}
	runScriptOnHosts(script: string, hosts: string[], restart=true): void {
		const requiredFiles = this.grabAllScriptRequirements(script);
		this.copyFiles(requiredFiles, hosts);
		if (restart) {
			this.scriptKill([script], hosts);
		}
		this.exec([script], hosts);
	}
}

import {NS, Server} from "@ns";

export class scanning {
	ns: NS;
	private _servers = new Map<string, [string[], Server]|undefined>();
	constructor(ns: NS) {
		this.ns = ns;
		this.discoveryScan();
		this.updateAll();
	}
	getServer(hostname: string, cached=true): Server {
		const server = this._servers.get(hostname);
		if (!cached || server===undefined) {return this.update(hostname);}
		return server[1];
	}
	getServers(cached=true): [string, [string[], Server]][] {
		if (!cached) {this.updateAll();}
		const servers = [...this._servers.entries()]
			.filter(([_name, data]): boolean=>data !== undefined) as [string, [string[], Server]][];
		return servers;
	}
	discoveryScan(): void {
		this._servers = new Map();
		const leftToScan: [string, string[]][] = [["home", []]];
		while (true) {
			const nextToScan = leftToScan.pop();
			if (nextToScan === undefined) {break;}
			const [hostname, path] = nextToScan;
			if (this._servers.get(hostname) !== undefined) {continue;}
			this._servers.set(hostname, [path, this.ns.getServer(hostname)]);
			const foundHosts = this.ns.scan(hostname);
			const foundHostsFormatted = foundHosts.map(foundHostName=> {
				return [foundHostName, path.concat([hostname])] as [string, string[]];
			});
			leftToScan.push(...foundHostsFormatted);
		}
	}
	updateAll(): Server[] {
		return [...this._servers.entries()].map(([hostname]): Server=>this.update(hostname));
	}
	update(hostname: string): Server {
		const isValidServer = this.ns.serverExists(hostname);
		if (!isValidServer) {throw new Error(`scanning: Invalid host ${hostname}.`);}
		const server = this.ns.getServer(hostname);
		const serverHolder = this._servers.get(hostname);
		if (serverHolder !== undefined) {
			serverHolder[1] = server;
		}
		return server;
	}
	pathToServer(hostname: string, shortCircuit=false): string[] {
		const serverRecord = this._servers.get(hostname);
		if (serverRecord===undefined) {return [];}
		const basePath = serverRecord[0];
		const resultPath = [hostname];
		for (let i=basePath.length-1;i>=0;i--) {
			resultPath.push(basePath[i]);
			if (shortCircuit && this.getServer(basePath[i]).backdoorInstalled) {
				return resultPath;
			}
		}
		return resultPath;
	}
}

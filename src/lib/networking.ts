import {NS} from "@ns";

export type requestCommand = ""|"priority"|"getTarget";
export type requestData = [requestCommand, ...string[]];
/** [ IDENTIFIER, PACKET_ID, requestData ] */
export type request = [string, number, requestData];

export type responseData = string[];
/** [ PACKET_ID, responseData ]*/
export type response = [number, responseData]|undefined;
/** Map< IDENTIFIER, [ PACKET_ID, responseData ] > */
export type responses = Map<string, response>;

export class networking {
	static requestPort = 2;
	static responsePort = 1;
	packetNumber = 0;
	ns: NS;
	identifier: string;
	constructor(ns: NS, hostName: string) {
		this.ns = ns;
		this.identifier = `${hostName}|${ns.pid}`;
	}
	// Client
	async writeRawRequest(request: request, port=networking.requestPort): Promise<void> {
		const data = JSON.stringify(request);
		while (!this.ns.tryWritePort(port, data)) {await this.ns.sleep(100);}
	}
	async sendRequest(message: requestData): Promise<void> {
		this.packetNumber++;
		const data = JSON.stringify([this.identifier, this.packetNumber, message]);
		while (!this.ns.tryWritePort(networking.requestPort, data)) {await this.ns.sleep(100);}
	}
	async receiveResponse(): Promise<responseData|undefined> {
		let result;
		for (let i=0;;i++) {
			result = this.grabResponseState().get(this.identifier);
			// Request timed out
			if (i > 100) {
				this.ns.print(`networking:${this.identifier}: Request timed out for packet ${this.packetNumber}.`);
				return;
			}
			await this.ns.sleep(100);
			// Request not ready
			if (result === undefined ||	result[0] < this.packetNumber) {continue;}
			// Request # too large
			if (result[0] > this.packetNumber) {
				this.ns.tprint(
					`networking:${this.identifier}: Packet # out of bounds.`+
					`Expected ${this.identifier}, got ${result[0]}.`,
				);
			}
			// Should be valid request OR request too large. Both are valid.
			break;
		}
		return result[1];
	}
	async request(message: requestData): Promise<responseData> {
		await this.sendRequest(message);
		const data = await this.receiveResponse();
		if (data === undefined) {
			throw new Error(`networking:${this.identifier}: Request timed out.`);
		}
		return data;
	}
	async requestNicRestart(): Promise<void> {
		this.packetNumber=-1;
		await this.sendRequest([""]);
		this.packetNumber=0;
	}
	// Server
	grabResponseState(): responses {
		const data = this.ns.peek(networking.responsePort).toString();
		if (data === "NULL PORT DATA") {return new Map();}
		const parsedData = JSON.parse(data) as [string, response][];
		return new Map(parsedData);
	}
	writeRawResponses(response: responses, port=networking.responsePort): void {
		const data = JSON.stringify(Array.from(response.entries()));
		this.ns.clearPort(port);
		this.ns.writePort(port, data);
	}
	receiveRequests(): request[] {
		const requests: request[] = [];
		while (true) {
			const portDataRaw = this.ns.readPort(networking.requestPort).toString();
			if (portDataRaw === "NULL PORT DATA") {break;}
			requests.push(JSON.parse(portDataRaw) as request);
		}
		return requests;
	}
	sendResponse(origionalRequest: request, responseData: responseData, responseHolder: responses|undefined): responses {
		const [requestId, requestPacketNumber] = origionalRequest;
		const responseHolderComplete = responseHolder ?? this.grabResponseState();
		responseHolderComplete.set(requestId, [requestPacketNumber, responseData]);
		return responseHolderComplete;
	}
}

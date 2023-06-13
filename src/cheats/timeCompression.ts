import {NS} from "@ns";
/* bitburner-src/src/Exploits/loops.ts
function timeCompression(): void {
	const timer = 1000 * 15;
	if (Player.exploits.includes(Exploit.TimeCompression)) return;
	// Time compression
	let last = performance.now();
	function minute(): void {
		const now = performance.now();
		if (now - last < 500) {
			// time has been compressed.
			Player.giveExploit(Exploit.TimeCompression);
			return;
		}
		last = now;
		window.setTimeout(minute, timer);
	}
	window.setTimeout(minute, timer);
}

*/

/*
no fuckin clue
*/

export function main(_ns: NS): void {
	// TODO: stub
}

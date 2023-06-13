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
brute force
was given a hint that said the password is lowercase only. NO caps/numbers/symbols/spaces
*/

/* eslint-disable array-element-newline */

const CHARS = [
	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
	"k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
	"u", "v", "w", "x", "y", "z",
];
/* eslint-enable array-element-newline */
const MAX = CHARS.length-1;
const NUM_ARRAY = [-1];

function next(currentCheck: number[]): void {
	for (let i = 0; i < currentCheck.length; i++) {
		if (currentCheck[i] === MAX) {
			currentCheck[i] = 0;
			continue;
		}
		currentCheck[i]++;
		return;
	}
	console.log(`${currentCheck.length} all checked`);
	currentCheck.push(0);
}
function translate(currentCheck: number[]): string {
	return currentCheck.map(charIndex=>CHARS[charIndex]).join("");
}

function check(_pass: string): boolean {
	return false;
}

export function main(_ns: NS): void {
	let isCorrect;
	do {
		next(NUM_ARRAY);
		isCorrect = check(translate(NUM_ARRAY));
	} while (!isCorrect);
	console.log(`FOUND PASS ${translate(NUM_ARRAY)}`);
}


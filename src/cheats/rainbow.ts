import {NS} from "@ns";
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

export async function main(ns: NS): Promise<void> {
	ns.disableLog("sleep");
	let isCorrect;
	let pass;
	let i=0;
	do {
		next(NUM_ARRAY);
		pass = translate(NUM_ARRAY);
		isCorrect = check(pass);
		if (i%128===0) {await ns.sleep(1);}
		i++;
	} while (!isCorrect);
	const message = `FOUND PASS ${pass} after ${i} tries`;
	console.log(message);
	ns.write(message);
	ns.alert(message);
}


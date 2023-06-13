import {NS, SourceFileLvl} from "@ns";

export function main(ns: NS): void {
	ns.write("/generatorResults/part1.txt", JSON.stringify(generate(ns)), "w");
	const bestScriptChain = [...ns.args] as string[];
	const nextScript = bestScriptChain.shift();
	if (nextScript !== undefined) {ns.spawn(nextScript, 1, ...bestScriptChain);}
}

// alternative

function generate(_ns: NS): SourceFileLvl[] {
	const generated: SourceFileLvl[] = [];
	generated.push({n: 1, lvl: 0});
	generated.push({n: 2, lvl: 0});
	generated.push({n: 3, lvl: 0});
	generated.push({n: 4, lvl: 0});
	generated.push({n: 5, lvl: 0});
	generated.push({n: 6, lvl: 0});
	generated.push({n: 7, lvl: 0});
	generated.push({n: 8, lvl: 0});
	generated.push({n: 9, lvl: 0});
	generated.push({n: 10, lvl: 0});
	generated.push({n: 11, lvl: 0});
	generated.push({n: 12, lvl: 0});
	generated.push({n: 13, lvl: 0});
	return generated;
}

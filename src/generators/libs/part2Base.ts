import {NS, SourceFileLvl} from "@ns";

type imports = Map<string, string[]>;
type functions = Set<string>;

export function generate(
	ns: NS,
	generators: ((
		ns: NS,
		imports: imports,
		functions: functions,
		sourceFiles: SourceFileLvl[]
	) => void)[],
): string {
	const imports: imports = new Map<string, string[]>();
	const functions: functions = new Set<string>();
	const sourceFiles = JSON.parse(ns.read("/generatorResults/part1.txt")) as SourceFileLvl[];
	// generators can make top level functions and imports
	for (const generator of generators) {
		generator(ns, imports, functions, sourceFiles);
	}
	// module checks import
	return stringifyData(imports, functions);
}

function stringifyData(imports: imports, functions: functions): string {
	let result = [...imports.entries()].map(([filename, variables]): string=>`import {${variables.join(",")}} from "${filename}"\n`).join("");
	result += [...functions.values()].join("\n");
	return result;
}

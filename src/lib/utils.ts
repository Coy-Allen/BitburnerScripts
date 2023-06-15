import {SourceFileLvl} from "@ns";

export function cartesian<t>(...sets: t[][]): t[][] {
	return sets.reduce<t[][]>((accSets, set): t[][]=> accSets.flatMap(accSet => set.map(value => [...accSet, value])), [[]]);
}
export function getSourceLevel(sourceFiles: SourceFileLvl[], n: SourceFileLvl["n"]): SourceFileLvl["lvl"] {
	return sourceFiles.find(sourceFile=>sourceFile.n === n)?.lvl ?? 0;
}

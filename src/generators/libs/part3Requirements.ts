import {SourceFileLvl} from "@ns";

type folderName = string;
type fileName = string;
type requirementList = SourceFileLvl[];
interface fileData {
	requirements: requirementList;
	priority: number; // lower is more likely to be culled. compared against all modules
	ramUsage?: number; // do not fill in. Is used internally
}
interface folderData {
	files: Map<fileName, fileData>;
}

/*
All Singularity using modules must have priorities lower than 30.
It is not recomended to put low ram usage modules below 40.
*/

export type requirementTree = Map<folderName, folderData>;
export const REQUIREMENTS: requirementTree = new Map([
	["hacking", {
		files: new Map([
			["printBackdoors", {
				priority: 50,
				requirements: [],
			}],
			["singularity", {
				priority: 30,
				requirements: [{n: 5, lvl: 1}],
			}],
		]),
	}],
	["hacknet", {
		files: new Map([
			["hacknet", {
				priority: 90,
				requirements: [],
			}],
		]),
	}],
]);


import {SourceFileLvl} from "@ns";

type folderName = string;
type fileName = string;
type requirementList = SourceFileLvl[];
interface fileData {
	requirements: requirementList;
	priority: number;
	ramUsage?: number;
}
interface folderData {
	priority: number;
	files: Map<fileName, fileData>;
}
export type requirementTree = Map<folderName, folderData>;
export const REQUIREMENTS: requirementTree = new Map([
	["hacking", {
		priority: 5,
		files: new Map([
			["printBackdoors", {
				priority: 2,
				requirements: [],
			}],
			/*
			["autoBackdoor", {
				priority: 1,
				requirements: [{n: 5, lvl: 1}],
			}],
			*/
		]),
	}],
]);


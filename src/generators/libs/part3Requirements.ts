import {SourceFileLvl} from "@ns";

export type folderName = string;
export type fileName = string;
export type requirementList = SourceFileLvl[];
export type subTree = Map<fileName, requirementList>;
export type requirementTree = Map<folderName, subTree>;

export const REQUIREMENTS: requirementTree = new Map([
	["hacking", new Map([
		["printBackdoors", []],
	])],
]);


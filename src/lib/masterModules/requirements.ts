import {SourceFileLvl} from "@ns";

type folderName = string;
type fileName = string;

export class requirementChecker {
	private _requirements: Record<folderName, Record<fileName, SourceFileLvl[]>> = {
		hacking: {
			printBackdoors: [],
		},
	};
	getRequirements(folderName: folderName, fileName: fileName): SourceFileLvl[] {
		const result = this._requirements[folderName][fileName];
		return JSON.parse(JSON.stringify(result)) as typeof result;
	}
	// TODO: stub
	// used to keep track of any source files needed by each module.
	// will tell you if you can't use a module.
	// can give you it's recommened pick of module for a grouping.
}

import {NS, Formulas, Player} from "@ns";
import {scanning} from "/lib/scanning";
import {responseData, networking} from "/lib/networking";


export interface getBestAction {
	command: string;
	args: string[];
	metrics: {
		async: false | asyncOptions;
		cost: number;
		incomePerSec: number;
	};
}

export interface asyncOptions {
	ram: number;
	time: number;
}

export interface mainState {
	nic: networking;
	ns: NS;
	scanning: scanning;
	calc: Formulas;
	player: Player;
}

export interface masterModule {
	initalize: (name: string, mainState: mainState) => void;
	requestHandler: (from: string, command: string, args: string[]) => responseData;
	getBestAction: () => getBestAction|undefined;
}

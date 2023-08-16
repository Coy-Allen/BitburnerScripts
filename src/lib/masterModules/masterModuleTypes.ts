import {NS, Formulas, Player} from "@ns";
import {scanning} from "/lib/scanning";
import {responseData, networking} from "/lib/networking";


export interface bestAction {
	command: string; // the command for the module
	args: string[]; // args for the command
	ttl?: number; // astermind will re-ask after this many milliseconds, never re-asks if not present
	metrics: { // used to help mastermind decide how good the action is compared to other modules
		async: false | asyncOptions; // gives async stats if aplicable
		cost: number; // cost of action
		incomePerSec: number; // resulting income per sec after action is preformed
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

/** @description The basis of all modules. */
export interface masterModule {
	initalize: (name: string, mainState: mainState) => void;
	/**
	 * @description Used to tell the module what action to take.
	 * It is recommended to include a "help" command for CLI compatability.
	 */
	requestHandler: (from: string, command: string, args: string[]) => responseData;
	getBestAction: () => bestAction|undefined;
}

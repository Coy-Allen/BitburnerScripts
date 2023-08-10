import {NS, Formulas, Player} from "@ns";
import {scanning} from "/lib/scanning";
import {responseData, networking} from "/lib/networking";


/**
 * @property	.command									- test
 * @property	.args											- test
 * @property	.priority									- test
 * @property	.metrics.timeInvestment		- test
 * @property	.metrics.payout						- test
 * @property	.metrics.incomePerSec			- test
 */
export interface getBestAction {
	command: string;
	args: string[];
	metrics: {
		timeInvestment: number;
		cost: number;
		incomePerSec: number;
	};
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

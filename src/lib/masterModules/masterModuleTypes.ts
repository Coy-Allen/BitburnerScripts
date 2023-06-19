import {NS, Formulas, Player} from "@ns";
import {scanning} from "/lib/scanning";
import {responseData, networking} from "/lib/networking";

export interface getBestAction {
	command: string;
	args: string[];
	priority: number;
	metrics: {
		timeInvestment: number;
		payout: number;
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
	requestHandler: (from: string, command: string, args: string[]) => Promise<responseData>;
	getBestAction: () => Promise<getBestAction|undefined>;
	stepRunner: (step: number) => void;
}

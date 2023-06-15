import {NS, Formulas, Player} from "@ns";
import {scanning} from "/lib/scanning";
import {nicId, requestCommand, requestArgs, responseData, networking} from "/lib/networking";

export interface getBestAction {
	command: requestCommand;
	args: requestArgs;
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
	requestHandler: (from: nicId, command: requestCommand, args: requestArgs) => Promise<responseData>;
	getBestAction: () => Promise<getBestAction|undefined>;
	stepRunner: (step: number) => void;
}

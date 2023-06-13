import {BitNodeMultipliers, Formulas, NS} from "@ns";

export function getBitnodeMult(ns: NS): BitNodeMultipliers {
	return ns.getBitNodeMultipliers();
}

export function getFormulas(ns: NS, _bitNodeMults: BitNodeMultipliers): Formulas {
	return ns.formulas;
}

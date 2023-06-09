export function cartesian<t>(...sets: t[][]): t[][] {
	return sets.reduce<t[][]>((accSets, set): t[][]=> accSets.flatMap(accSet => set.map(value => [...accSet, value])), [[]]);
}

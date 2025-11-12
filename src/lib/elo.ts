export interface ELOResult {
	newELOA: number
	newELOB: number
	changeA: number
	changeB: number
}

export function calculateELO(
	eloA: number,
	eloB: number,
	aWins: boolean,
	comparisonCountA: number,
	comparisonCountB: number
): ELOResult {
	const kFactorA = getKFactor(comparisonCountA)
	const kFactorB = getKFactor(comparisonCountB)
	
	const expectedA = 1 / (1 + Math.pow(10, (eloB - eloA) / 400))
	const expectedB = 1 / (1 + Math.pow(10, (eloA - eloB) / 400))
	
	const actualA = aWins ? 1 : 0
	const actualB = aWins ? 0 : 1
	
	const changeA = kFactorA * (actualA - expectedA)
	const changeB = kFactorB * (actualB - expectedB)
	
	return {
		newELOA: Math.round(eloA + changeA),
		newELOB: Math.round(eloB + changeB),
		changeA: Math.round(changeA),
		changeB: Math.round(changeB)
	}
}

function getKFactor(comparisonCount: number): number {
	if (comparisonCount < 10) return 32
	if (comparisonCount < 50) return 24
	return 16
}


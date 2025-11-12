import { prisma } from './prisma'
import type { BuildingSubmission } from '@prisma/client'

interface ComparisonPair {
	submissionA: BuildingSubmission
	submissionB: BuildingSubmission
}

export async function selectNextComparisonPair(
	userId: string,
	excludeIds: string[] = []
): Promise<ComparisonPair | null> {
	// 1. Get all published submissions user hasn't compared
	const comparedPairs = await prisma.comparison.findMany({
		where: { userId },
		select: { submissionAId: true, submissionBId: true }
	})
	
	const excludedPairKeys = new Set(
		comparedPairs.map(c => {
			// Create consistent pair key (always smaller ID first)
			const pair = [c.submissionAId, c.submissionBId].sort()
			return `${pair[0]}-${pair[1]}`
		})
	)
	
	// 2. Get candidate submissions (allow comparing own submissions)
	const candidates = await prisma.buildingSubmission.findMany({
		where: {
			status: 'PUBLISHED',
			id: { notIn: excludeIds }
		},
		orderBy: { totalComparisons: 'asc' } // Prioritize low comparison count
	})
	
	console.log(`[ComparisonSelection] User ${userId}: Found ${candidates.length} candidate submissions`)
	
	if (candidates.length < 2) {
		// Check total published submissions to provide better error message
		const totalPublished = await prisma.buildingSubmission.count({
			where: { status: 'PUBLISHED' }
		})
		console.log(`[ComparisonSelection] Total published: ${totalPublished}, Available: ${candidates.length}`)
		return null
	}
	
	// 3. Weighted selection algorithm
	// - 60% weight: Similar ELO (within 200 points)
	// - 30% weight: Low comparison count (needs more data)
	// - 10% weight: Random selection
	
	const scoredPairs: Array<{ pair: ComparisonPair, score: number }> = []
	
	// Generate candidate pairs
	for (let i = 0; i < candidates.length; i++) {
		for (let j = i + 1; j < candidates.length; j++) {
			const subA = candidates[i]
			const subB = candidates[j]
			
			// Skip if already compared
			const pairKey = [subA.id, subB.id].sort().join('-')
			if (excludedPairKeys.has(pairKey)) continue
			
			// Calculate score
			const eloDiff = Math.abs(subA.eloRating - subB.eloRating)
			const eloScore = eloDiff <= 200 ? 0.6 : 0.6 * (1 - Math.min(eloDiff / 400, 0.5))
			
			const avgComparisons = (subA.totalComparisons + subB.totalComparisons) / 2
			const comparisonScore = 0.3 * (1 - Math.min(avgComparisons / 50, 1))
			
			const randomScore = 0.1 * Math.random()
			
			const totalScore = eloScore + comparisonScore + randomScore
			
			scoredPairs.push({
				pair: { submissionA: subA, submissionB: subB },
				score: totalScore
			})
		}
	}
	
	if (scoredPairs.length === 0) {
		console.log(`[ComparisonSelection] No valid pairs found after filtering (${excludedPairKeys.size} already compared)`)
		return null
	}
	
	console.log(`[ComparisonSelection] Found ${scoredPairs.length} valid pairs to choose from`)
	
	// Sort by score and pick top one
	scoredPairs.sort((a, b) => b.score - a.score)
	
	// Add some randomness to top 3
	const topN = Math.min(3, scoredPairs.length)
	const selected = scoredPairs[Math.floor(Math.random() * topN)]
	
	return selected.pair
}


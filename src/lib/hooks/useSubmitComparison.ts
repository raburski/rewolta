import { useState } from 'react'
import { postFetcher } from '../fetcher'

interface SubmitComparisonParams {
	submissionAId: string
	submissionBId: string
	winnerId: string
	tagsForA?: string[]
	tagsForB?: string[]
}

interface SubmitComparisonResponse {
	comparison: {
		id: string
		createdAt: string
	}
	updatedRatings: {
		submissionA: { eloRating: number, change: number }
		submissionB: { eloRating: number, change: number }
	}
}

export function useSubmitComparison() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const submitComparison = async (params: SubmitComparisonParams): Promise<SubmitComparisonResponse | null> => {
		setIsSubmitting(true)
		setError(null)

		try {
			const response = await postFetcher('/api/comparisons', params)
			return response
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to submit comparison'
			setError(errorMessage)
			return null
		} finally {
			setIsSubmitting(false)
		}
	}

	return {
		submitComparison,
		isSubmitting,
		error
	}
}


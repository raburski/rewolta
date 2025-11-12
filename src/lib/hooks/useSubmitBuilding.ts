import { useState } from 'react'
import { postFetcher } from '../fetcher'

interface SubmitBuildingParams {
	imageId: string
	productId: string
}

interface SubmissionResponse {
	submission: {
		id: string
		imageId: string
		productId: string
		status: 'PENDING' | 'PUBLISHED'
		submittedAt: string
		eloRating: number
	}
}

export function useSubmitBuilding() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const submitBuilding = async (params: SubmitBuildingParams): Promise<SubmissionResponse | null> => {
		setIsSubmitting(true)
		setError(null)

		try {
			const response = await postFetcher('/api/submissions', params)
			return response
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to submit building'
			setError(errorMessage)
			return null
		} finally {
			setIsSubmitting(false)
		}
	}

	return {
		submitBuilding,
		isSubmitting,
		error
	}
}


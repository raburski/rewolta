import useSWR from 'swr'

interface ImageData {
	id: string
	productId: string
	ownerId: string
	imageUrl: string
	imageId: string
	createdAt: string
	updatedAt: string
	submission?: {
		id: string
		status: 'PENDING' | 'PUBLISHED' | 'WITHDRAWN' | 'FLAGGED'
		submittedAt: string
		eloRating: number
	} | null
}

export function useImageDetail(imageId: string) {
	const { data, error, isLoading, mutate } = useSWR<ImageData>(
		imageId ? `/api/images/${imageId}` : null
	)

	const hasError = !!error
	const errorMessage = error?.message || 'Nie udało się załadować obrazu'

	return {
		imageData: data,
		isLoading,
		hasError,
		error: errorMessage,
		mutate
	}
} 
import useSWR from 'swr'

interface GeneratedImage {
	id: string
	imageUrl: string
	createdAt: string
	status: string
	productId: string
}

interface ImagesResponse {
	images: GeneratedImage[]
}

export function useUserImages(productId: string, isAuthenticated: boolean) {
	const { data, error, isLoading, mutate } = useSWR<ImagesResponse>(
		isAuthenticated && productId ? `/api/user/images/${productId}` : null
	)

	const images = data?.images || []
	const hasError = !!error

	return {
		images,
		isLoading,
		hasError,
		error: error?.message || 'Failed to load images',
		mutate
	}
} 
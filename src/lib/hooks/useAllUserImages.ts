import useSWR from 'swr'

interface GeneratedImage {
	id: string
	imageUrl: string
	createdAt: string
	status: string
	productId: string
	productName?: string
}

interface ImagesResponse {
	images: GeneratedImage[]
}

export function useAllUserImages(isAuthenticated: boolean) {
	const { data, error, isLoading, mutate } = useSWR<ImagesResponse>(
		isAuthenticated ? '/api/user/images' : null
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



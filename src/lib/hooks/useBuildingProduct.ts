import useSWR from 'swr'
import { BuildingProduct } from '@prisma/client'

export type { BuildingProduct }

interface BuildingProductResponse {
	product: BuildingProduct
}

export function useBuildingProduct(productId: string | null) {
	const { data, error, isLoading, mutate } = useSWR<BuildingProductResponse>(
		productId ? `/api/building-products/${productId}` : null
	)

	const product = data?.product
	const hasError = !!error

	return {
		product,
		isLoading,
		hasError,
		error: error?.message || 'Failed to load building product',
		mutate
	}
}


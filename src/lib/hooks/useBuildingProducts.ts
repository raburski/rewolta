import useSWR from 'swr'
import { BuildingProduct } from '@prisma/client'

export type { BuildingProduct }

interface BuildingProductsResponse {
	products: BuildingProduct[]
}

export function useBuildingProducts() {
	const { data, error, isLoading, mutate } = useSWR<BuildingProductsResponse>(
		'/api/building-products'
	)

	const products = data?.products || []
	const hasError = !!error

	return {
		products,
		isLoading,
		hasError,
		error: error?.message || 'Failed to load building products',
		mutate
	}
}


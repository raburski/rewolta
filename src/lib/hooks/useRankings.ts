import { useSWRPaginated } from '@raburski/next-pagination/client'

interface RankingSubmission {
	id: string
	imageId: string
	imageUrl: string
	productId: string
	productName: string
	userId: string
	userName: string
	eloRating: number
	totalComparisons: number
	wins: number
	losses: number
	topTags: Array<{ tag: string, count: number }>
}

interface Ranking {
	rank: number
	submission: RankingSubmission
}

interface RankingsParams {
	type?: 'global' | 'product' | 'tag' | 'time'
	productId?: string
	timeRange?: 'daily' | 'weekly' | 'monthly' | 'alltime'
	limit?: number
}

function buildRankingsUrl(params: RankingsParams): string {
	const searchParams = new URLSearchParams()
	
	if (params.type) searchParams.set('type', params.type)
	if (params.productId) searchParams.set('productId', params.productId)
	if (params.timeRange) searchParams.set('timeRange', params.timeRange)

	const queryString = searchParams.toString()
	return `/api/rankings${queryString ? `?${queryString}` : ''}`
}

export function useRankings(params: RankingsParams = {}) {
	const limit = params.limit || 20
	const url = buildRankingsUrl(params)
	
	const {
		data: rankings,
		error,
		isLoading,
		isLoadingMore,
		totalCount,
		hasMore,
		loadMore,
		resetPagination
	} = useSWRPaginated<Ranking>(url, { limit })

	return {
		rankings: rankings || [],
		total: totalCount || 0,
		hasMore,
		isLoading,
		isLoadingMore,
		hasError: !!error,
		error: error?.message || null,
		loadMore,
		resetPagination
	}
}


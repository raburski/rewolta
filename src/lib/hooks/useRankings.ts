import useSWR from 'swr'
import { fetcher } from '../fetcher'

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

interface RankingsResponse {
	rankings: Ranking[]
	total: number
	hasMore: boolean
}

interface RankingsParams {
	type?: 'global' | 'product' | 'tag' | 'time'
	productId?: string
	tag?: string
	timeRange?: 'daily' | 'weekly' | 'monthly' | 'alltime'
	limit?: number
	offset?: number
}

function buildRankingsUrl(params: RankingsParams): string {
	const searchParams = new URLSearchParams()
	
	if (params.type) searchParams.set('type', params.type)
	if (params.productId) searchParams.set('productId', params.productId)
	if (params.tag) searchParams.set('tag', params.tag)
	if (params.timeRange) searchParams.set('timeRange', params.timeRange)
	if (params.limit) searchParams.set('limit', params.limit.toString())
	if (params.offset) searchParams.set('offset', params.offset.toString())

	const queryString = searchParams.toString()
	return `/api/rankings${queryString ? `?${queryString}` : ''}`
}

export function useRankings(params: RankingsParams = {}) {
	const url = buildRankingsUrl(params)
	const { data, error, isLoading, mutate } = useSWR<RankingsResponse>(url, fetcher)

	return {
		rankings: data?.rankings || [],
		total: data?.total || 0,
		hasMore: data?.hasMore || false,
		isLoading,
		hasError: !!error,
		error: error?.message || null,
		refresh: mutate
	}
}


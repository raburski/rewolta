import useSWR from 'swr'
import { fetcher } from '../fetcher'

interface Submission {
	id: string
	imageId: string
	imageUrl: string
	productId: string
	productName: string
	userId: string
	userName: string
}

interface NextComparisonResponse {
	submissionA: Submission
	submissionB: Submission
}

export function useNextComparison(excludeIds: string[] = [], productId?: string | null) {
	const params = new URLSearchParams()
	if (excludeIds.length > 0) {
		params.set('excludeIds', excludeIds.join(','))
	}
	if (productId) {
		params.set('product', productId)
	}
	
	const queryString = params.toString()
	const url = queryString ? `/api/comparisons/next?${queryString}` : '/api/comparisons/next'
	
	const { data, error, isLoading, mutate } = useSWR<NextComparisonResponse>(
		url,
		fetcher,
		{
			shouldRetryOnError: false,
			revalidateOnFocus: false,
			revalidateOnReconnect: false
		}
	)

	// Check if error is a 404 (no more comparisons available)
	const isNoMoreComparisons = error && (
		(error as any)?.status === 404 ||
		(error as any)?.response?.status === 404 ||
		error?.message?.includes('404') ||
		error?.message?.includes('No comparison pairs available')
	)

	return {
		comparison: data,
		isLoading,
		hasError: !!error,
		error: isNoMoreComparisons 
			? 'Oceniłeś już wszystkie aktualnie możliwe pary!'
			: error?.message || null,
		isNoMoreComparisons,
		refresh: mutate
	}
}


import useSWR from 'swr'

interface CreditsResponse {
	credits: number
	success: boolean
}

export function useUserCredits(isAuthenticated: boolean) {
	const { data, error, isLoading, mutate } = useSWR<CreditsResponse>(
		isAuthenticated ? '/api/user/credits' : null
	)

	const credits = data?.credits ?? 0
	const hasError = !!error

	return {
		credits,
		isLoading,
		hasError,
		mutate
	}
} 
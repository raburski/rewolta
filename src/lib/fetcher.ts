interface FetcherOptions {
	method?: string
	body?: any
	headers?: Record<string, string>
}

export const fetcher = async (url: string, options?: FetcherOptions) => {
	const config: RequestInit = {
		method: options?.method || 'GET',
		headers: {
			'Content-Type': 'application/json',
			...options?.headers
		}
	}

	if (options?.body) {
		config.body = JSON.stringify(options.body)
	}

	const response = await fetch(url, config)
	
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}`)
	}
	
	return response.json()
}

// Convenience functions for different HTTP methods
export const getFetcher = (url: string) => fetcher(url, { method: 'GET' })
export const postFetcher = (url: string, body: any) => fetcher(url, { method: 'POST', body })
export const putFetcher = (url: string, body: any) => fetcher(url, { method: 'PUT', body })
export const deleteFetcher = (url: string) => fetcher(url, { method: 'DELETE' }) 
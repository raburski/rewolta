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
		let errorMessage = `Failed to fetch ${url}`
		try {
			const errorData = await response.json()
			errorMessage = errorData.error || errorMessage
		} catch {
			// If response is not JSON, use default message
		}
		
		const error: any = new Error(errorMessage)
		error.status = response.status
		error.response = response
		throw error
	}
	
	return response.json()
}

// Convenience functions for different HTTP methods
export const getFetcher = (url: string) => fetcher(url, { method: 'GET' })
export const postFetcher = (url: string, body: any) => fetcher(url, { method: 'POST', body })
export const putFetcher = (url: string, body: any) => fetcher(url, { method: 'PUT', body })
export const deleteFetcher = (url: string) => fetcher(url, { method: 'DELETE' }) 
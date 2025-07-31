interface OpenAICallParams {
	endpoint: string
	apiKey?: string
	body: any
}

export async function callOpenAI({ endpoint, apiKey, body }: OpenAICallParams) {
	const response = await fetch(endpoint, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	})
	if (!response.ok) {
		const errorData = await response.json()
		throw { status: response.status, error: errorData }
	}
	return response.json()
} 
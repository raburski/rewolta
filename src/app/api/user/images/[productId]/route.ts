import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { withAuth } from '@raburski/next-auth-permissions/server'
import { APIHandler, compose } from '@raburski/next-api-middleware'
import { ensureHttpsUrl } from '@/lib/urlUtils'

const IMGEN_PROXY_URL = ensureHttpsUrl(process.env.IMGEN_PROXY_URL || 'https://your-imgen-proxy-url.com')
const IMGEN_PROXY_API_KEY = process.env.IMGEN_PROXY_API_KEY

const handler: APIHandler = async (request, context) => {
	try {
		const { session } = context
		const params = await context.params
		const { productId } = params as { productId: string }

		if (!productId) {
			return NextResponse.json(
				{ error: 'Missing product ID' },
				{ status: 400 }
			)
		}

		if (!IMGEN_PROXY_API_KEY) {
			console.error('IMGEN_PROXY_API_KEY not configured')
			return NextResponse.json(
				{ error: 'Image service not configured' },
				{ status: 500 }
			)
		}

		// Sanitize ownerId (same logic as in generate-building route)
		const rawOwnerId = session.user?.id || session.user?.email || 'unknown'
		const ownerId = rawOwnerId
			.replace(/[^a-zA-Z0-9@._-]/g, '') // Remove special characters except email-safe ones
			.replace(/@/g, '_') // Replace @ with _
			.replace(/\./g, '_') // Replace . with _
			.substring(0, 100) // Limit length
			.toLowerCase() // Normalize to lowercase

		console.log(`Fetching images for product: ${productId}, owner: ${ownerId}`)

        console.log('URL:', `${IMGEN_PROXY_URL}/api/v1/images/list/${productId}/${ownerId}`)

		// Fetch images from imgen-proxy
		const response = await fetch(`${IMGEN_PROXY_URL}/api/v1/images/list/${productId}/${ownerId}`, {
			method: 'GET',
			headers: {
				'x-api-key': IMGEN_PROXY_API_KEY,
				'Cache-Control': 'no-cache',
				'Pragma': 'no-cache'
			}
		})

		if (!response.ok) {
			const errorData = await response.json()
			console.error('imgen-proxy list error:', errorData)
			throw new Error(`imgen-proxy error: ${response.status}`)
		}

		const data = await response.json()
		console.log

		if (!data.success) {
			throw new Error('Invalid response from imgen-proxy')
		}

		// Transform the response to match our frontend expectations
		const images = data.data?.images?.map((item: any) => ({
			id: item.id,
			imageUrl: item.imageUrl,
			createdAt: item.createdAt,
			status: 'completed', // All images in list are completed
			productId: item.productId
		})) || []

		return NextResponse.json({ images })

	} catch (error) {
		console.error('Error fetching images:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch images' },
			{ status: 500 }
		)
	}
}

export const GET = compose(
	withAuth
)(handler) 
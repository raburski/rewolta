import { NextRequest, NextResponse } from 'next/server'
import { ensureHttpsUrl } from '@/lib/urlUtils'

const IMGEN_PROXY_URL = ensureHttpsUrl(process.env.IMGEN_PROXY_URL || 'https://your-imgen-proxy-url.com')
const IMGEN_PROXY_API_KEY = process.env.IMGEN_PROXY_API_KEY

export async function GET(
	request: NextRequest,
	{ params }: { params: { imageId: string } }
) {
	try {
		const { imageId } = params

		if (!imageId) {
			return NextResponse.json(
				{ error: 'Missing image ID' },
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

		console.log(`Fetching image with ID: ${imageId}`)

		// Fetch image from imgen-proxy
		const response = await fetch(`${IMGEN_PROXY_URL}/api/v1/images/id/${imageId}`, {
			method: 'GET',
			headers: {
				'x-api-key': IMGEN_PROXY_API_KEY,
				'Cache-Control': 'no-cache',
				'Pragma': 'no-cache'
			}
		})

		if (!response.ok) {
			const errorData = await response.json()
			console.error('imgen-proxy image fetch error:', errorData)
			throw new Error(`imgen-proxy error: ${response.status}`)
		}

		const data = await response.json()
		console.log('Image fetched successfully:', data)

		if (!data.success) {
			throw new Error('Invalid response from imgen-proxy')
		}

		// Return the image data
		return NextResponse.json(data.data)

	} catch (error) {
		console.error('Error fetching image:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch image' },
			{ status: 500 }
		)
	}
} 
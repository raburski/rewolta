import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { ensureHttpsUrl } from '@/lib/urlUtils'

const IMGEN_PROXY_URL = ensureHttpsUrl(process.env.IMGEN_PROXY_URL || 'https://your-imgen-proxy-url.com')
const IMGEN_PROXY_API_KEY = process.env.IMGEN_PROXY_API_KEY

export async function GET(request: NextRequest) {
	try {
		// Check authentication
		const session = await auth()
		if (!session) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
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

		console.log(`Fetching credits for owner: ${ownerId}`)

		// Fetch credits from imgen-proxy
		const response = await fetch(`${IMGEN_PROXY_URL}/api/v1/images/credits/${ownerId}`, {
			method: 'GET',
			headers: {
				'x-api-key': IMGEN_PROXY_API_KEY,
				'Cache-Control': 'no-cache',
				'Pragma': 'no-cache'
			}
		})

		if (!response.ok) {
			const errorData = await response.json()
			console.error('imgen-proxy credits error:', errorData)
			throw new Error(`imgen-proxy error: ${response.status}`)
		}

		const data = await response.json()
		console.log('Credits response:', data)

		if (!data.success) {
			throw new Error('Invalid response from imgen-proxy')
		}

		// Return the credits data
		return NextResponse.json({ 
			credits: data.data?.remainingCredits || 0,
			success: true
		})

	} catch (error) {
		console.error('Error fetching credits:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch credits' },
			{ status: 500 }
		)
	}
} 
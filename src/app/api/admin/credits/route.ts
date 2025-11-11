import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { withPermission } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { APIHandler, compose } from '@raburski/next-api-middleware'
import { ensureHttpsUrl } from '@/lib/urlUtils'

const IMGEN_PROXY_URL = ensureHttpsUrl(process.env.IMGEN_PROXY_URL || 'https://your-imgen-proxy-url.com')
const IMGEN_PROXY_API_KEY = process.env.IMGEN_PROXY_API_KEY

// Update credits for all users
const handler: APIHandler = async (request, context) => {
	try {

		if (!IMGEN_PROXY_API_KEY) {
			console.error('IMGEN_PROXY_API_KEY not configured')
			return NextResponse.json(
				{ error: 'Image service not configured' },
				{ status: 500 }
			)
		}

		const body = await request.json().catch(() => null)
		if (!body || typeof body !== 'object' || typeof body.credits !== 'number') {
			return NextResponse.json(
				{ error: 'Invalid request body. Expected { credits: number }' },
				{ status: 400 }
			)
		}

		const { credits } = body

		console.log(`Updating credits for all users to ${credits}`)

		// Update credits for all users via imgen-proxy
		const response = await fetch(`${IMGEN_PROXY_URL}/api/v1/images/credits/all`, {
			method: 'POST',
			headers: {
				'x-api-key': IMGEN_PROXY_API_KEY,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ credits })
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => null)
			console.error('imgen-proxy update all credits error:', errorData)
			throw new Error(`imgen-proxy error: ${response.status}`)
		}

		const data = await response.json()
		console.log('Update all credits response:', data)

		if (!data.success) {
			throw new Error('Invalid response from imgen-proxy')
		}

		return NextResponse.json({
			success: true,
			message: 'Credits updated for all users'
		})
	} catch (error) {
		console.error('Error updating credits for all users:', error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to update credits' },
			{ status: 500 }
		)
	}
}

export const POST = compose(
	withPermission(Permission.USERS_SET_CREDITS)
)(handler)


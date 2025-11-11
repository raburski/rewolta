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

		if (!IMGEN_PROXY_API_KEY) {
			console.error('IMGEN_PROXY_API_KEY not configured')
			return NextResponse.json(
				{ error: 'Image generation service not configured' },
				{ status: 500 }
			)
		}

		// Sanitize ownerId (same logic as in generate-building)
		const rawOwnerId = session.user?.id || session.user?.email || 'unknown'
		const ownerId = rawOwnerId
			.replace(/[^a-zA-Z0-9@._-]/g, '') // Remove special characters except email-safe ones
			.replace(/@/g, '_') // Replace @ with _
			.replace(/\./g, '_') // Replace . with _
			.substring(0, 100) // Limit length
			.toLowerCase() // Normalize to lowercase

		console.log('Deleting all images for user:', ownerId)

		// Call imgen DELETE /images/for/:id to remove all associated data
		const response = await fetch(`${IMGEN_PROXY_URL}/api/v1/images/for/${ownerId}`, {
			method: 'DELETE',
			headers: {
				'x-api-key': IMGEN_PROXY_API_KEY,
				'Content-Type': 'application/json'
			}
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
			console.error('imgen-proxy delete error:', errorData)
			throw new Error(`imgen-proxy error: ${response.status}`)
		}

		const data = await response.json()
		console.log('Successfully deleted user data:', data)

		// Check if the deletion was successful
		if (!data.success) {
			throw new Error('Failed to delete user data from imgen-proxy')
		}

		return NextResponse.json({
			success: true,
			message: 'Account and all associated data deleted successfully',
		})
	} catch (error) {
		console.error('Error in user delete API:', error)
		return NextResponse.json(
			{ error: 'Failed to delete user account and data' },
			{ status: 500 }
		)
	}
}

export const DELETE = compose(
	withAuth
)(handler)

import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { withPermission } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { APIHandler, compose } from '@raburski/next-api-middleware'
import { prisma } from '@/lib/prisma'
import { ensureHttpsUrl } from '@/lib/urlUtils'

const IMGEN_PROXY_URL = ensureHttpsUrl(process.env.IMGEN_PROXY_URL || 'https://your-imgen-proxy-url.com')
const IMGEN_PROXY_API_KEY = process.env.IMGEN_PROXY_API_KEY

// Get credits for a specific user
const getHandler: APIHandler = async (request, context) => {
	try {
		const params = await context.params
		const { id } = params as { id: string }

		if (!IMGEN_PROXY_API_KEY) {
			console.error('IMGEN_PROXY_API_KEY not configured')
			return NextResponse.json(
				{ error: 'Image service not configured' },
				{ status: 500 }
			)
		}

		// Get the user to find their ownerId
		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true
			}
		})

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		// Sanitize ownerId (same logic as in other routes)
		const rawOwnerId = user.id || user.email || 'unknown'
		const ownerId = rawOwnerId
			.replace(/[^a-zA-Z0-9@._-]/g, '')
			.replace(/@/g, '_')
			.replace(/\./g, '_')
			.substring(0, 100)
			.toLowerCase()

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
			const errorData = await response.json().catch(() => null)
			console.error('imgen-proxy credits error:', errorData)
			throw new Error(`imgen-proxy error: ${response.status}`)
		}

		const data = await response.json()
		console.log('Credits response:', data)

		if (!data.success) {
			throw new Error('Invalid response from imgen-proxy')
		}

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

// Update credits for a specific user
const postHandler: APIHandler = async (request, context) => {
	try {
		const params = await context.params
		const { id } = params as { id: string }

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

		// Get the user to find their ownerId
		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true
			}
		})

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		// Sanitize ownerId (same logic as in other routes)
		const rawOwnerId = user.id || user.email || 'unknown'
		const ownerId = rawOwnerId
			.replace(/[^a-zA-Z0-9@._-]/g, '')
			.replace(/@/g, '_')
			.replace(/\./g, '_')
			.substring(0, 100)
			.toLowerCase()

		console.log(`Updating credits for owner: ${ownerId} to ${credits}`)

		// Update credits via imgen-proxy
		const response = await fetch(`${IMGEN_PROXY_URL}/api/v1/images/credits/${ownerId}`, {
			method: 'POST',
			headers: {
				'x-api-key': IMGEN_PROXY_API_KEY,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ credits })
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => null)
			console.error('imgen-proxy update credits error:', errorData)
			throw new Error(`imgen-proxy error: ${response.status}`)
		}

		const data = await response.json()
		console.log('Update credits response:', data)

		if (!data.success) {
			throw new Error('Invalid response from imgen-proxy')
		}

		return NextResponse.json({
			credits: data.data?.remainingCredits || credits,
			success: true
		})
	} catch (error) {
		console.error('Error updating credits:', error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to update credits' },
			{ status: 500 }
		)
	}
}

export const GET = compose(
	withPermission(Permission.USERS_VIEW)
)(getHandler)

export const POST = compose(
	withPermission(Permission.USERS_SET_CREDITS)
)(postHandler)


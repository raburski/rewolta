import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { auth } from '@/lib/auth'
import { APIHandler } from '@raburski/next-api-middleware'
import { prisma } from '@/lib/prisma'
import { ensureHttpsUrl } from '@/lib/urlUtils'

const IMGEN_PROXY_URL = ensureHttpsUrl(process.env.IMGEN_PROXY_URL || 'https://your-imgen-proxy-url.com')
const IMGEN_PROXY_API_KEY = process.env.IMGEN_PROXY_API_KEY

export const GET: APIHandler = async (request, context) => {
	try {
		const params = await context.params
		const { imageId } = params as { imageId: string }

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

		// Check if image is already submitted (if user is authenticated)
		const session = await auth()
		let submission = null

		if (session?.user?.id) {
			submission = await prisma.buildingSubmission.findFirst({
				where: {
					imageId: imageId,
					userId: session.user.id
				},
				select: {
					id: true,
					status: true,
					submittedAt: true,
					eloRating: true
				}
			})
		}

		// Return the image data with submission info
		return NextResponse.json({
			...data.data,
			submission: submission ? {
				id: submission.id,
				status: submission.status,
				submittedAt: submission.submittedAt.toISOString(),
				eloRating: submission.eloRating
			} : null
		})

	} catch (error) {
		console.error('Error fetching image:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch image' },
			{ status: 500 }
		)
	}
} 
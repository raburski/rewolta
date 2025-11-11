import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { withAuth } from '@raburski/next-auth-permissions/server'
import { APIHandler, compose } from '@raburski/next-api-middleware'
import { ensureHttpsUrl } from '@/lib/urlUtils'
import { prisma } from '@/lib/prisma'

const IMGEN_PROXY_URL = ensureHttpsUrl(process.env.IMGEN_PROXY_URL || 'https://your-imgen-proxy-url.com')
const IMGEN_PROXY_API_KEY = process.env.IMGEN_PROXY_API_KEY

const handler: APIHandler = async (request, context) => {
	try {
		const { session } = context

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

		// Get all active building products
		const products = await prisma.buildingProduct.findMany({
			where: { status: 'ACTIVE' },
			select: {
				id: true,
				name: true
			}
		})

		// Fetch images for all products in parallel
		const imagePromises = products.map(async (product) => {
			try {
				const response = await fetch(`${IMGEN_PROXY_URL}/api/v1/images/list/${product.id}/${ownerId}`, {
					method: 'GET',
					headers: {
						'x-api-key': IMGEN_PROXY_API_KEY,
						'Cache-Control': 'no-cache',
						'Pragma': 'no-cache'
					}
				})

				if (!response.ok) {
					console.error(`Failed to fetch images for product ${product.id}: ${response.status}`)
					return []
				}

				const data = await response.json()

				if (!data.success) {
					console.error(`Invalid response for product ${product.id}`)
					return []
				}

				// Transform the response to match our frontend expectations
				const images = data.data?.images?.map((item: any) => ({
					id: item.id,
					imageUrl: item.imageUrl,
					createdAt: item.createdAt,
					status: 'completed',
					productId: item.productId,
					productName: product.name
				})) || []

				return images
			} catch (error) {
				console.error(`Error fetching images for product ${product.id}:`, error)
				return []
			}
		})

		// Wait for all requests to complete
		const imageArrays = await Promise.all(imagePromises)

		// Flatten and sort by creation date (newest first)
		const allImages = imageArrays
			.flat()
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

		return NextResponse.json({ images: allImages })

	} catch (error) {
		console.error('Error fetching all images:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch images' },
			{ status: 500 }
		)
	}
}

export const GET = compose(
	withAuth
)(handler)


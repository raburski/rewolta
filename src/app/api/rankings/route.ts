import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { withPermission } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { APIHandler, compose } from '@raburski/next-api-middleware'
import { withPagination } from '@raburski/next-pagination/server'
import { prisma } from '@/lib/prisma'
import { ensureHttpsUrl } from '@/lib/urlUtils'

const IMGEN_PROXY_URL = ensureHttpsUrl(process.env.IMGEN_PROXY_URL || 'https://your-imgen-proxy-url.com')
const IMGEN_PROXY_API_KEY = process.env.IMGEN_PROXY_API_KEY

const handler: APIHandler = async (request, context) => {
	try {
		const { searchParams } = new URL(request.url)
		const type = searchParams.get('type') || 'global'
		const productId = searchParams.get('productId')
		const timeRange = searchParams.get('timeRange') || 'alltime'
		
		// Get pagination info from context (provided by withPagination middleware)
		const { page, limit, offset } = context

		// Build where clause
		const where: any = {
			status: 'PUBLISHED'
		}

		if (type === 'product' && productId) {
			where.productId = productId
		}

		// Time range filter
		if (timeRange !== 'alltime') {
			const now = new Date()
			let startDate: Date

			switch (timeRange) {
				case 'daily':
					startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
					break
				case 'weekly':
					startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
					break
				case 'monthly':
					startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
					break
				default:
					startDate = new Date(0)
			}

			where.publishedAt = {
				gte: startDate
			}
		}

		// Get total count
		const totalCount = await prisma.buildingSubmission.count({ where })

		// Get submissions ordered by ELO
		const submissions = await prisma.buildingSubmission.findMany({
			where,
			orderBy: { eloRating: 'desc' },
			take: limit,
			skip: offset,
			include: {
				product: {
					select: { name: true }
				},
				user: {
					select: { name: true }
				},
				tags: {
					orderBy: { count: 'desc' },
					take: 5,
					select: { tag: true, count: true }
				}
			}
		})

		// Fetch image URLs from imgen-proxy
		const imageUrlPromises = submissions.map(async (sub) => {
			if (!IMGEN_PROXY_API_KEY) return ''
			
			try {
				const response = await fetch(`${IMGEN_PROXY_URL}/api/v1/images/id/${sub.imageId}`, {
					headers: { 'x-api-key': IMGEN_PROXY_API_KEY }
				})
				
				if (response.ok) {
					const data = await response.json()
					return data.data?.imageUrl || ''
				}
			} catch (error) {
				console.error(`Error fetching image URL for ${sub.imageId}:`, error)
			}
			
			return ''
		})

		const imageUrls = await Promise.all(imageUrlPromises)

		const rankings = submissions.map((sub, index) => ({
			rank: offset + index + 1,
			submission: {
				id: sub.id,
				imageId: sub.imageId,
				imageUrl: imageUrls[index],
				productId: sub.productId,
				productName: sub.product.name,
				userId: sub.userId,
				userName: sub.user.name || '',
				eloRating: sub.eloRating,
				totalComparisons: sub.totalComparisons,
				wins: sub.wins,
				losses: sub.losses,
				topTags: sub.tags.map(t => ({ tag: t.tag, count: t.count }))
			}
		}))

		// Return in format expected by @raburski/next-pagination
		return NextResponse.json({
			data: rankings,
			totalCount,
			page,
			limit
		})
	} catch (error) {
		console.error('Error fetching rankings:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

export const GET = compose(
	withPermission(Permission.RANKINGS_VIEW),
	withPagination
)(handler)


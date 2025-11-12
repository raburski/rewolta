import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { withPermission } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { APIHandler, compose } from '@raburski/next-api-middleware'
import { prisma } from '@/lib/prisma'

const handler: APIHandler = async (request, context) => {
	try {
		const { searchParams } = new URL(request.url)
		const type = searchParams.get('type') || 'global'
		const productId = searchParams.get('productId')
		const tag = searchParams.get('tag')
		const timeRange = searchParams.get('timeRange') || 'alltime'
		const limit = parseInt(searchParams.get('limit') || '50')
		const offset = parseInt(searchParams.get('offset') || '0')

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

		// Get submissions ordered by ELO
		let submissions = await prisma.buildingSubmission.findMany({
			where,
			orderBy: { eloRating: 'desc' },
			take: limit + 1,
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

		// Filter by tag if specified
		if (tag) {
			const tagLower = tag.toLowerCase()
			submissions = submissions.filter(sub => 
				sub.tags.some(t => t.tag === tagLower)
			)
		}

		const hasMore = submissions.length > limit
		if (hasMore) {
			submissions = submissions.slice(0, limit)
		}

		// Get total count
		const total = await prisma.buildingSubmission.count({ where })

		const rankings = submissions.map((sub, index) => ({
			rank: offset + index + 1,
			submission: {
				id: sub.id,
				imageId: sub.imageId,
				imageUrl: '', // Would need to fetch from imgen-proxy
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

		return NextResponse.json({
			rankings,
			total,
			hasMore
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
	withPermission(Permission.RANKINGS_VIEW)
)(handler)


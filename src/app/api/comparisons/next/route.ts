import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { withPermission } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { APIHandler, compose } from '@raburski/next-api-middleware'
import { selectNextComparisonPair } from '@/lib/comparisonSelection'
import { prisma } from '@/lib/prisma'
import { ensureHttpsUrl } from '@/lib/urlUtils'

const IMGEN_PROXY_URL = ensureHttpsUrl(process.env.IMGEN_PROXY_URL || 'https://your-imgen-proxy-url.com')
const IMGEN_PROXY_API_KEY = process.env.IMGEN_PROXY_API_KEY

const handler: APIHandler = async (request, context) => {
	try {
		const { session } = context
		const { searchParams } = new URL(request.url)
		const excludeIdsParam = searchParams.get('excludeIds')
		const excludeIds = excludeIdsParam ? excludeIdsParam.split(',') : []

		const pair = await selectNextComparisonPair(session.user!.id, excludeIds)

		if (!pair) {
			return NextResponse.json(
				{ error: 'No comparison pairs available' },
				{ status: 404 }
			)
		}

		// Fetch product and user data
		const [productA, productB, userA, userB] = await Promise.all([
			prisma.buildingProduct.findUnique({
				where: { id: pair.submissionA.productId },
				select: { name: true }
			}),
			prisma.buildingProduct.findUnique({
				where: { id: pair.submissionB.productId },
				select: { name: true }
			}),
			prisma.user.findUnique({
				where: { id: pair.submissionA.userId },
				select: { name: true }
			}),
			prisma.user.findUnique({
				where: { id: pair.submissionB.userId },
				select: { name: true }
			})
		])

		// Fetch image URLs from imgen-proxy
		let imageUrlA = ''
		let imageUrlB = ''

		if (IMGEN_PROXY_API_KEY) {
			try {
				const [responseA, responseB] = await Promise.all([
					fetch(`${IMGEN_PROXY_URL}/api/v1/images/id/${pair.submissionA.imageId}`, {
						headers: { 'x-api-key': IMGEN_PROXY_API_KEY }
					}),
					fetch(`${IMGEN_PROXY_URL}/api/v1/images/id/${pair.submissionB.imageId}`, {
						headers: { 'x-api-key': IMGEN_PROXY_API_KEY }
					})
				])

				if (responseA.ok) {
					const dataA = await responseA.json()
					imageUrlA = dataA.data?.imageUrl || ''
				}

				if (responseB.ok) {
					const dataB = await responseB.json()
					imageUrlB = dataB.data?.imageUrl || ''
				}
			} catch (error) {
				console.error('Error fetching image URLs:', error)
			}
		}

		return NextResponse.json({
			submissionA: {
				id: pair.submissionA.id,
				imageId: pair.submissionA.imageId,
				imageUrl: imageUrlA,
				productId: pair.submissionA.productId,
				productName: productA?.name || '',
				userId: pair.submissionA.userId,
				userName: userA?.name || ''
			},
			submissionB: {
				id: pair.submissionB.id,
				imageId: pair.submissionB.imageId,
				imageUrl: imageUrlB,
				productId: pair.submissionB.productId,
				productName: productB?.name || '',
				userId: pair.submissionB.userId,
				userName: userB?.name || ''
			}
		})
	} catch (error) {
		console.error('Error getting next comparison:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

export const GET = compose(
	withPermission(Permission.COMPARISONS_CREATE)
)(handler)


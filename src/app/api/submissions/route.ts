import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { withPermission } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { APIHandler, compose } from '@raburski/next-api-middleware'
import { prisma } from '@/lib/prisma'
import { getInitialSubmissionStatus } from '@/lib/submissionUtils'
import { ensureHttpsUrl } from '@/lib/urlUtils'

const IMGEN_PROXY_URL = ensureHttpsUrl(process.env.IMGEN_PROXY_URL || 'https://your-imgen-proxy-url.com')
const IMGEN_PROXY_API_KEY = process.env.IMGEN_PROXY_API_KEY

const handler: APIHandler = async (request, context) => {
	try {
		const { session } = context
		const { imageId, productId } = await request.json()

		if (!imageId || !productId) {
			return NextResponse.json(
				{ error: 'Missing required fields: imageId and productId' },
				{ status: 400 }
			)
		}

		// Validate product exists
		const product = await prisma.buildingProduct.findUnique({
			where: { id: productId }
		})

		if (!product) {
			return NextResponse.json(
				{ error: 'Invalid productId' },
				{ status: 404 }
			)
		}

		// Validate image exists and belongs to user
		// For now, we'll check if image exists in imgen-proxy
		// In a real implementation, you might want to verify ownership more strictly
		if (IMGEN_PROXY_API_KEY) {
			const rawOwnerId = session.user?.id || session.user?.email || 'unknown'
			const ownerId = rawOwnerId
				.replace(/[^a-zA-Z0-9@._-]/g, '')
				.replace(/@/g, '_')
				.replace(/\./g, '_')
				.substring(0, 100)
				.toLowerCase()

			try {
				const imageResponse = await fetch(`${IMGEN_PROXY_URL}/api/v1/images/id/${imageId}`, {
					method: 'GET',
					headers: {
						'x-api-key': IMGEN_PROXY_API_KEY,
					}
				})

				if (!imageResponse.ok) {
					return NextResponse.json(
						{ error: 'Image not found or does not belong to user' },
						{ status: 404 }
					)
				}

				const imageData = await imageResponse.json()
				if (!imageData.success || imageData.data?.productId !== productId) {
					return NextResponse.json(
						{ error: 'Image does not match product' },
						{ status: 400 }
					)
				}
			} catch (error) {
				console.error('Error validating image:', error)
				// Continue anyway - image validation is best effort for now
			}
		}

		// Check if submission already exists for this image
		const existing = await prisma.buildingSubmission.findFirst({
			where: {
				imageId,
				userId: session.user!.id
			}
		})

		if (existing) {
			return NextResponse.json(
				{ error: 'Submission already exists for this image' },
				{ status: 409 }
			)
		}

		// Create submission
		const status = getInitialSubmissionStatus()
		const submission = await prisma.buildingSubmission.create({
			data: {
				imageId,
				productId,
				userId: session.user!.id,
				status,
				publishedAt: status === 'PUBLISHED' ? new Date() : null
			}
		})

		return NextResponse.json({
			submission: {
				id: submission.id,
				imageId: submission.imageId,
				productId: submission.productId,
				status: submission.status,
				submittedAt: submission.submittedAt.toISOString(),
				eloRating: submission.eloRating
			}
		})
	} catch (error) {
		console.error('Error creating submission:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

export const POST = compose(
	withPermission(Permission.SUBMISSIONS_CREATE)
)(handler)


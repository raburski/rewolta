import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { withPermission } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { APIHandler, compose } from '@raburski/next-api-middleware'
import { prisma } from '@/lib/prisma'
import { calculateELO } from '@/lib/elo'
import { updateTagCounts } from '@/lib/tagAggregation'

const handler: APIHandler = async (request, context) => {
	try {
		const { session } = context
		const { submissionAId, submissionBId, winnerId, tagsForA, tagsForB } = await request.json()

		if (!submissionAId || !submissionBId || !winnerId) {
			return NextResponse.json(
				{ error: 'Missing required fields: submissionAId, submissionBId, winnerId' },
				{ status: 400 }
			)
		}

		if (winnerId !== submissionAId && winnerId !== submissionBId) {
			return NextResponse.json(
				{ error: 'Winner must be either submissionA or submissionB' },
				{ status: 400 }
			)
		}

		// Validate submissions exist and are published
		const [subA, subB] = await Promise.all([
			prisma.buildingSubmission.findUnique({
				where: { id: submissionAId }
			}),
			prisma.buildingSubmission.findUnique({
				where: { id: submissionBId }
			})
		])

		if (!subA || !subB) {
			return NextResponse.json(
				{ error: 'One or both submissions not found' },
				{ status: 404 }
			)
		}

		if (subA.status !== 'PUBLISHED' || subB.status !== 'PUBLISHED') {
			return NextResponse.json(
				{ error: 'Submissions must be published' },
				{ status: 400 }
			)
		}

		// Allow comparing own submissions - no restriction needed

		// Check if user has already compared this pair
		const existingComparison = await prisma.comparison.findFirst({
			where: {
				userId: session.user!.id,
				OR: [
					{
						submissionAId: submissionAId,
						submissionBId: submissionBId
					},
					{
						submissionAId: submissionBId,
						submissionBId: submissionAId
					}
				]
			}
		})

		if (existingComparison) {
			return NextResponse.json(
				{ error: 'Already compared this pair' },
				{ status: 409 }
			)
		}

		// Calculate ELO updates
		const aWins = winnerId === submissionAId
		const eloResult = calculateELO(
			subA.eloRating,
			subB.eloRating,
			aWins,
			subA.totalComparisons,
			subB.totalComparisons
		)

		// Create comparison and update ratings in a transaction
		const result = await prisma.$transaction(async (tx) => {
			// Create comparison record
			const comparison = await tx.comparison.create({
				data: {
					submissionAId,
					submissionBId,
					userId: session.user!.id,
					winnerId
				}
			})

			// Create comparison tags if provided
			if (tagsForA && tagsForA.length > 0) {
				await tx.comparisonTag.createMany({
					data: tagsForA.map((tag: string) => ({
						comparisonId: comparison.id,
						submissionId: submissionAId,
						tag: tag.toLowerCase().trim(),
						side: 'A'
					}))
				})
			}

			if (tagsForB && tagsForB.length > 0) {
				await tx.comparisonTag.createMany({
					data: tagsForB.map((tag: string) => ({
						comparisonId: comparison.id,
						submissionId: submissionBId,
						tag: tag.toLowerCase().trim(),
						side: 'B'
					}))
				})
			}

			// Update submission A
			await tx.buildingSubmission.update({
				where: { id: submissionAId },
				data: {
					eloRating: eloResult.newELOA,
					totalComparisons: { increment: 1 },
					wins: aWins ? { increment: 1 } : undefined,
					losses: !aWins ? { increment: 1 } : undefined
				}
			})

			// Update submission B
			await tx.buildingSubmission.update({
				where: { id: submissionBId },
				data: {
					eloRating: eloResult.newELOB,
					totalComparisons: { increment: 1 },
					wins: !aWins ? { increment: 1 } : undefined,
					losses: aWins ? { increment: 1 } : undefined
				}
			})

			return comparison
		})

		// Update tag counts (outside transaction for performance)
		if (tagsForA && tagsForA.length > 0) {
			await updateTagCounts(submissionAId, tagsForA)
		}
		if (tagsForB && tagsForB.length > 0) {
			await updateTagCounts(submissionBId, tagsForB)
		}

		return NextResponse.json({
			comparison: {
				id: result.id,
				createdAt: result.createdAt.toISOString()
			},
			updatedRatings: {
				submissionA: {
					eloRating: eloResult.newELOA,
					change: eloResult.changeA
				},
				submissionB: {
					eloRating: eloResult.newELOB,
					change: eloResult.changeB
				}
			}
		})
	} catch (error) {
		console.error('Error submitting comparison:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

export const POST = compose(
	withPermission(Permission.COMPARISONS_CREATE)
)(handler)


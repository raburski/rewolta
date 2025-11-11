import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { Permission } from '@/lib/permissions'
import { withPagination } from '@raburski/next-pagination/server'
import { APIHandler } from '@raburski/next-api-middleware'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/middleware/permissions'
import { compose } from '@/lib/middleware/compose'

const handler: APIHandler = async (request, context) => {
	const { createPaginatedPrismaResponse } = context

	return NextResponse.json(
		await createPaginatedPrismaResponse(prisma.user, {
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				status: true,
				createdAt: true,
			}
		})
	)
}

export const GET = compose(
	withPermission(Permission.USERS_VIEW),
	withPagination
)(handler)



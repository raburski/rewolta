import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { Permission } from '@/lib/permissions'
import { withPagination } from '@raburski/next-pagination/server'
import { APIHandler, compose } from '@raburski/next-api-middleware'
import { withPermission } from '@raburski/next-auth-permissions/server'
import { prisma } from '@/lib/prisma'

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



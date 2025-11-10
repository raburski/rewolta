import { NextRequest, NextResponse } from 'next/server'
import '@/lib/authUtils'
import { requireUserCan } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
	const { session, error } = await requireUserCan(Permission.USERS_VIEW, request)

	if (error) {
		return error
	}

	try {
		const users = await prisma.user.findMany({
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

		return NextResponse.json({ users })
	} catch (err) {
		console.error('Error fetching admin users:', err)
		return NextResponse.json(
			{ error: 'Failed to load users' },
			{ status: 500 }
		)
	}
}



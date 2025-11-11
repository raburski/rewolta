import { NextRequest, NextResponse } from 'next/server'
import '@/lib/authUtils'
import { auth } from '@/lib/auth'
import { requireUserCan } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const session = await auth()

		// Allow unauthenticated users to view profiles, but without sensitive data
		const isAuthenticated = !!session?.user?.id
		const isOwner = isAuthenticated && session.user.id === id
		
		// Check if user has permission to view users (only if authenticated)
		let canViewUsers = false
		if (isAuthenticated) {
			const { error: permissionError } = await requireUserCan(Permission.USERS_VIEW, request)
			canViewUsers = !permissionError
		}

		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
				status: true,
				createdAt: true,
				updatedAt: true
			}
		})

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		// Only include email if user is owner or has permission to view users
		const canViewEmail = isOwner || canViewUsers
		const userData = {
			...user,
			email: canViewEmail ? user.email : null
		}

		return NextResponse.json({ user: userData })
	} catch (error) {
		console.error('Error fetching user:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}


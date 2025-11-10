import { NextRequest, NextResponse } from 'next/server'
import '@/lib/authUtils'
import { requireUserCan } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { UserRole, UserStatus } from '@prisma/client'

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
	const { userId } = params

	const { error } = await requireUserCan(Permission.USERS_MANAGE, request)

	if (error) {
		return error
	}

	try {
		const body = await request.json().catch(() => null)

		if (!body || typeof body !== 'object') {
			return NextResponse.json({ error: 'Nieprawidłowe dane' }, { status: 400 })
		}

		const { role, status } = body as { role?: UserRole, status?: UserStatus }

		if (!role || !status) {
			return NextResponse.json({ error: 'Brak wymaganych pól' }, { status: 400 })
		}

		if (!Object.values(UserRole).includes(role)) {
			return NextResponse.json({ error: 'Nieprawidłowa rola' }, { status: 400 })
		}

		if (!Object.values(UserStatus).includes(status)) {
			return NextResponse.json({ error: 'Nieprawidłowy status' }, { status: 400 })
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { role, status },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				status: true,
				createdAt: true,
				updatedAt: true
			}
		})

		return NextResponse.json({ user: updatedUser })
	} catch (updateError) {
		console.error('Error updating user:', updateError)
		return NextResponse.json({ error: 'Nie udało się zaktualizować użytkownika' }, { status: 500 })
	}
}

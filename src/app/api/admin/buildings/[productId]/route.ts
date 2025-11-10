import { NextRequest, NextResponse } from 'next/server'
import '@/lib/authUtils'
import { requireUserCan } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
	const { productId } = params

	const { error } = await requireUserCan(Permission.BUILDING_PRODUCTS_MANAGE, request)

	if (error) {
		return error
	}

	try {
		const body = await request.json().catch(() => null)

		if (!body || typeof body !== 'object') {
			return NextResponse.json({ error: 'Nieprawidłowe dane' }, { status: 400 })
		}

		const { name, status } = body as { name?: string, status?: 'ACTIVE' | 'INACTIVE' }

		if (!name || !status) {
			return NextResponse.json({ error: 'Brak wymaganych pól' }, { status: 400 })
		}

		if (status !== 'ACTIVE' && status !== 'INACTIVE') {
			return NextResponse.json({ error: 'Nieprawidłowy status' }, { status: 400 })
		}

		const updatedProduct = await prisma.buildingProduct.update({
			where: { id: productId },
			data: { name, status },
			select: {
				id: true,
				name: true,
				status: true,
				createdAt: true,
				updatedAt: true
			}
		})

		return NextResponse.json({ product: updatedProduct })
	} catch (updateError) {
		console.error('Error updating building product:', updateError)
		return NextResponse.json({ error: 'Nie udało się zaktualizować generatora' }, { status: 500 })
	}
}

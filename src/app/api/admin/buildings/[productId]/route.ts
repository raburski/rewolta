import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { withPermission } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { APIHandler, compose } from '@raburski/next-api-middleware'
import { prisma } from '@/lib/prisma'

const handler: APIHandler = async (request, context) => {
	const params = await context.params
	const { productId } = params as { productId: string }

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

export const PUT = compose(
	withPermission(Permission.BUILDING_PRODUCTS_MANAGE)
)(handler)

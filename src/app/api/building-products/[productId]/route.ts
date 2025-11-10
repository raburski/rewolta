import { NextRequest, NextResponse } from 'next/server'
import '@/lib/authUtils'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Permission } from '@/lib/permissions'
import { checkPermission } from '@raburski/next-auth-permissions/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: { productId: string } }
) {
	try {
		const { productId } = params
		const session = await auth()
		const canViewAll = session ? checkPermission(session, Permission.BUILDING_PRODUCTS_VIEW_ALL) : false

		const product = await prisma.buildingProduct.findUnique({
			where: { id: productId }
		})

		if (!product) {
			return NextResponse.json(
				{ error: 'Product not found' },
				{ status: 404 }
			)
		}

		// Regular users can only see active products
		if (!canViewAll && product.status !== 'ACTIVE') {
			return NextResponse.json(
				{ error: 'Product not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json({ product })
	} catch (error) {
		console.error('Error fetching building product:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch building product' },
			{ status: 500 }
		)
	}
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
	try {
		const products = await prisma.buildingProduct.findMany({
			where: { status: 'ACTIVE' },
			orderBy: {
				createdAt: 'asc'
			}
		})

		return NextResponse.json({
			products
		})
	} catch (error) {
		console.error('Error fetching building products:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch building products' },
			{ status: 500 }
		)
	}
}


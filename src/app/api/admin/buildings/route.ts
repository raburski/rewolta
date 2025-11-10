import { NextRequest, NextResponse } from 'next/server'
import '@/lib/authUtils'
import { requireUserCan } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { uploadToBunnyCDN, createThumbnail } from '@/lib/bunnyCdnUtils'
import { BuildingProductStatus } from '@prisma/client'
import { randomBytes } from 'crypto'

export async function GET(request: NextRequest) {
	const { session, error } = await requireUserCan(Permission.BUILDING_PRODUCTS_MANAGE, request)

	if (error) {
		return error
	}

	try {
		const products = await prisma.buildingProduct.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				imageUrl: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			}
		})

		return NextResponse.json({ products })
	} catch (err) {
		console.error('Error fetching admin building products:', err)
		return NextResponse.json(
			{ error: 'Failed to load building products' },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	const { session, error } = await requireUserCan(Permission.BUILDING_PRODUCTS_MANAGE, request)

	if (error) {
		return error
	}

	try {
		const formData = await request.formData()
		const name = formData.get('name') as string
		const description = formData.get('description') as string
		const status = formData.get('status') as BuildingProductStatus
		const imageFile = formData.get('image') as File | null

		if (!name || !description) {
			return NextResponse.json(
				{ error: 'Name and description are required' },
				{ status: 400 }
			)
		}

		if (!imageFile) {
			return NextResponse.json(
				{ error: 'Image file is required' },
				{ status: 400 }
			)
		}

		// Generate unique ID for the product
		const productId = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.substring(0, 50) || `product-${randomBytes(8).toString('hex')}`

		// Check if product ID already exists
		const existing = await prisma.buildingProduct.findUnique({
			where: { id: productId }
		})

		if (existing) {
			return NextResponse.json(
				{ error: 'A product with this name already exists' },
				{ status: 400 }
			)
		}

		// Convert image file to buffer
		const imageBuffer = Buffer.from(await imageFile.arrayBuffer())

		// Create thumbnail
		const thumbnailBuffer = await createThumbnail(imageBuffer, 400, 400, 0.85)

		// Generate file names
		const timestamp = Date.now()
		const imageFileName = `references/${productId}-${timestamp}.jpg`
		const thumbnailFileName = `references/${productId}-${timestamp}-thumb.jpg`

		// Upload both images to Bunny CDN
		const cdnUrl = await uploadToBunnyCDN(imageBuffer, imageFileName, 'image/jpeg')
		const imageUrl = await uploadToBunnyCDN(thumbnailBuffer, thumbnailFileName, 'image/jpeg')

		// Create the building product
		const product = await prisma.buildingProduct.create({
			data: {
				id: productId,
				name,
				description,
				imageUrl,
				cdnUrl,
				status: status || BuildingProductStatus.INACTIVE,
			},
			select: {
				id: true,
				name: true,
				imageUrl: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			}
		})

		return NextResponse.json({ product })
	} catch (err) {
		console.error('Error creating building product:', err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Failed to create building product' },
			{ status: 500 }
		)
	}
}



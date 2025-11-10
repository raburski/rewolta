import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function getBuildingProductById(
	productId: string,
	userRole?: UserRole
) {
	const isAdmin = userRole === UserRole.ADMIN

	const product = await prisma.buildingProduct.findUnique({
		where: { id: productId }
	})

	if (!product) {
		return null
	}

	// Regular users can only see active products
	if (!isAdmin && product.status !== 'ACTIVE') {
		return null
	}

	return product
}


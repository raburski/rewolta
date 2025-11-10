import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getBuildingProductById } from '@/lib/buildingProductUtils'
import Layout from '@/app/components/Layout/Layout'
import PageContent from '@/app/components/PageContent/PageContent'
import ImageHistory from './ImageHistory'

interface PageProps {
	params: {
		productId: string
	}
}

export default async function ImageHistoryPage({ params }: PageProps) {
	const session = await auth()

	if (!session) {
		redirect('/api/auth/signin')
	}

	const { productId } = params

	// Validate productId using database
	const userRole = session.user?.role
	const product = await getBuildingProductById(productId, userRole)
	if (!product) {
		redirect('/ai')
	}

	return (
		<Layout
			title={`Historia generowań: ${product.name}`}
			subtitle="Twoje wygenerowane obrazy"
		>
			<PageContent>
				<ImageHistory productId={productId} />
			</PageContent>
		</Layout>
	)
} 
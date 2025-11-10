import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getBuildingProductById } from '@/lib/buildingProductUtils'
import Layout from '@/app/components/Layout/Layout'
import PageContent from '@/app/components/PageContent/PageContent'
import ImageDetail from './ImageDetail'

interface PageProps {
	params: {
		imageId: string
	}
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { imageId } = params

	try {
		// Fetch image data for metadata
		const baseUrl = process.env.NEXTAUTH_URL || 'https://rewolta.org'
		const response = await fetch(`${baseUrl}/api/images/${imageId}`, {
			next: { revalidate: 3600 * 24 * 30 } // Cache for month
		})

		if (response.ok) {
			const imageData = await response.json()
			
			// Get product name from database
			const product = await getBuildingProductById(imageData.productId)
			const productName = product?.name || imageData.productId
			
			return {
				title: `Wygenerowany obraz - ${productName}`,
				description: 'Sprawdź ten wygenerowany budynek! 🏛️✨',
				openGraph: {
					title: `Wygenerowany obraz - ${productName}`,
					description: 'Sprawdź ten wygenerowany budynek! 🏛️✨',
					url: `${baseUrl}/images/${imageId}`,
					images: [
						{
							url: imageData.imageUrl,
							width: 1200,
							height: 630,
							alt: 'Wygenerowany budynek'
						}
					],
					type: 'website'
				},
				twitter: {
					card: 'summary_large_image',
					title: `Wygenerowany obraz - ${productName}`,
					description: 'Sprawdź ten wygenerowany budynek! 🏛️✨',
					images: [imageData.imageUrl]
				}
			}
		}
	} catch (error) {
		console.error('Error generating metadata:', error)
	}

	// Fallback metadata
	return {
		title: 'Wygenerowany obraz',
		description: 'Sprawdź ten wygenerowany budynek! 🏛️✨',
		openGraph: {
			title: 'Wygenerowany obraz',
			description: 'Sprawdź ten wygenerowany budynek! 🏛️✨',
			url: `${process.env.NEXTAUTH_URL || 'https://rewolta.org'}/images/${imageId}`,
			type: 'website'
		}
	}
}

export default async function ImageDetailPage({ params }: PageProps) {
	const { imageId } = params

	if (!imageId) {
		redirect('/profile/images/museum')
	}

	return (
		<Layout
			title="Szczegóły obrazu"
			subtitle="Wygenerowany obraz"
		>
			<PageContent>
				<ImageDetail imageId={imageId} />
			</PageContent>
		</Layout>
	)
} 
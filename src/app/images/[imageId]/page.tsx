import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import ImageDetail from './ImageDetail'
import styles from './page.module.css'

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
			
			return {
				title: `Wygenerowany obraz - ${imageData.productId}`,
				description: 'Sprawdź ten wygenerowany budynek! 🏛️✨',
				openGraph: {
					title: `Wygenerowany obraz - ${imageData.productId}`,
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
					title: `Wygenerowany obraz - ${imageData.productId}`,
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
		<main className={styles.main}>
			<Header 
				title="Szczegóły obrazu"
				subtitle="Wygenerowany obraz"
			/>

			<div className={styles.content}>
				<ImageDetail imageId={imageId} />
			</div>
			<Footer />
		</main>
	)
} 
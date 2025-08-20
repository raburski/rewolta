import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { buildingProducts } from '@/content/ai'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import ImageHistory from './ImageHistory'
import styles from './page.module.css'

interface PageProps {
	params: {
		productId: string
	}
}

export default async function ImageHistoryPage({ params }: PageProps) {
	const session = await getServerSession(authOptions)

	if (!session) {
		redirect('/api/auth/signin')
	}

	const { productId } = params

	// Validate productId using ai.ts data
	const product = buildingProducts.find(p => p.id === productId)
	if (!product) {
		redirect('/ai')
	}

	return (
		<main className={styles.main}>
			<Header 
				title={`Historia generowań: ${product.name}`}
				subtitle="Twoje wygenerowane obrazy"
			/>

			<div className={styles.content}>
				<ImageHistory productId={productId} />
			</div>
			<Footer />
		</main>
	)
} 
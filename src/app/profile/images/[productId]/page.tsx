import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
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

	// Validate productId
	const validProductIds = ['museum']
	if (!validProductIds.includes(productId)) {
		redirect('/ai/museum')
	}

	return (
		<main className={styles.main}>
			<Header 
				title={`Historia generowań: ${productId}`}
				subtitle="Twoje wygenerowane obrazy"
			/>

			<div className={styles.content}>
				<ImageHistory productId={productId} />
			</div>
			<Footer />
		</main>
	)
} 
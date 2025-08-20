'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { buildingProducts } from '@/content/ai'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import AIGenerator from '../components/AIGenerator'
import styles from './page.module.css'

interface PageProps {
	params: {
		productId: string
	}
}

export default function AIProductPage({ params }: PageProps) {
	const { productId } = params
	const router = useRouter()
	const product = buildingProducts.find(p => p.id === productId)

	// If product doesn't exist, redirect to main AI page
	useEffect(() => {
		if (!product) {
			router.push('/ai')
		}
	}, [product, router])

	if (!product) {
		return (
			<main className={styles.main}>
				<Header 
					title="Produkt nie znaleziony"
					subtitle="Przekierowywanie do strony głównej AI"
				/>
				<div className={styles.content}>
					<div className={styles.generatorContainer}>
						<div style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							height: '50vh',
							fontSize: '1.1rem',
							color: '#666'
						}}>
							Przekierowywanie...
						</div>
					</div>
				</div>
				<Footer />
			</main>
		)
	}

	return (
		<main className={styles.main}>
			<Header 
				title={`AI Generator: ${product.name}`}
				subtitle="Generuj obrazy z pomocą sztucznej inteligencji"
			/>

			<div className={styles.content}>
				<div className={styles.generatorContainer}>
					<AIGenerator productId={productId} />
				</div>
			</div>
			<Footer />
		</main>
	)
} 
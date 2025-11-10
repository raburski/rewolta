'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/app/components/Layout/Layout'
import PageContent from '@/app/components/PageContent/PageContent'
import { useBuildingProduct } from '@/lib/hooks/useBuildingProduct'
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
	const { product, isLoading } = useBuildingProduct(productId)

	// If product doesn't exist, redirect to main AI page
	useEffect(() => {
		if (!isLoading && !product) {
			router.push('/ai')
		}
	}, [product, isLoading, router])

	if (isLoading) {
		return (
			<Layout
				title="Ładowanie..."
				subtitle=""
			>
				<PageContent>
					<div className={styles.generatorContainer}>
						<div style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							height: '50vh',
							fontSize: '1.1rem',
							color: '#666'
						}}>
							Ładowanie...
						</div>
					</div>
				</PageContent>
			</Layout>
		)
	}

	if (!product) {
		return (
			<Layout
				title="Produkt nie znaleziony"
				subtitle="Przekierowywanie do strony głównej AI"
			>
				<PageContent>
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
				</PageContent>
			</Layout>
		)
	}

	return (
		<Layout
			title={`AI Generator: ${product.name}`}
			subtitle="Generuj obrazy z pomocą sztucznej inteligencji"
		>
			<PageContent>
				<div className={styles.generatorContainer}>
					<AIGenerator productId={productId} />
				</div>
			</PageContent>
		</Layout>
	)
} 
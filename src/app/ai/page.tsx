'use client'

import Link from 'next/link'
import { FaWandMagicSparkles } from 'react-icons/fa6'
import Layout from '@/app/components/Layout/Layout'
import PageContent from '@/app/components/PageContent/PageContent'
import styles from './page.module.css'
import { useBuildingProducts } from '@/lib/hooks/useBuildingProducts'

const layoutProps = {
	title: 'AI Generatory',
	subtitle: 'Wybierz jeden z naszych generatorów AI, aby stworzyć unikalne budynki'
}

export default function AIProductsPage() {
	const { products, isLoading, hasError } = useBuildingProducts()

	if (isLoading) {
		return (
			<Layout {...layoutProps}>
				<PageContent>
					<p>Ładowanie...</p>
				</PageContent>
			</Layout>
		)
	}

	if (hasError) {
		return (
			<Layout {...layoutProps}>
				<PageContent>
					<p>Wystąpił błąd podczas ładowania produktów.</p>
				</PageContent>
			</Layout>
		)
	}

	return (
		<Layout {...layoutProps}>
			<PageContent>
				<div className={styles.productsGrid}>
					{products.map((product) => (
						<div key={product.id} className={styles.productCard}>
							<Link
								href={`/ai/${product.id}`}
								className={styles.cardLink}
							>
								<div className={styles.productImage}>
									<img
										src={product.imageUrl}
										alt={product.name}
										className={styles.image}
									/>
									<div className={styles.overlay}>
										<FaWandMagicSparkles className={styles.magicIcon} />
									</div>
								</div>
								<div className={styles.productInfo}>
									<h3 className={styles.productName}>{product.name}</h3>
									<p className={styles.productDescription}>
										{product.description}
									</p>
									<div className={styles.tryButton}>
										<FaWandMagicSparkles className={styles.buttonIcon} />
										Wypróbuj
									</div>
								</div>
							</Link>
						</div>
					))}
				</div>
			</PageContent>
		</Layout>
	)
} 
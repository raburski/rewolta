'use client'

import Link from 'next/link'
import { FaWandMagicSparkles } from 'react-icons/fa6'
import { IoAdd } from 'react-icons/io5'
import Layout from '@/app/components/Layout/Layout'
import PageContent from '@/app/components/PageContent/PageContent'
import styles from './page.module.css'
import { useBuildingProducts } from '@/lib/hooks/useBuildingProducts'
import { useUserCan } from '@raburski/next-auth-permissions/client'
import { Permission } from '@/lib/permissions'

const layoutProps = {
	title: 'AI Generatory',
	subtitle: 'Wybierz jeden z naszych generatorów AI, aby stworzyć unikalne budynki'
}

export default function AIProductsPage() {
	const { products, isLoading, hasError } = useBuildingProducts()
	const canUseCustom = useUserCan(Permission.IMAGE_GENERATION_CUSTOM)

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
					
					{/* Custom Building card - only for CREATOR users */}
					{canUseCustom && (
						<div className={styles.productCard}>
							<Link
								href="/ai/custom"
								className={styles.cardLink}
							>
								<div className={styles.productImage}>
									<div className={styles.customPlaceholder}>
										<IoAdd className={styles.customIcon} />
										<span>Dodaj własny budynek</span>
									</div>
									<div className={styles.overlay}>
										<FaWandMagicSparkles className={styles.magicIcon} />
									</div>
								</div>
								<div className={styles.productInfo}>
									<h3 className={styles.productName}>Własny budynek</h3>
									<p className={styles.productDescription}>
										Użyj własnego obrazu budynku jako źródła
									</p>
									<div className={styles.tryButton}>
										<FaWandMagicSparkles className={styles.buttonIcon} />
										Wypróbuj
									</div>
								</div>
							</Link>
						</div>
					)}
				</div>
			</PageContent>
		</Layout>
	)
} 
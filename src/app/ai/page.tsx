'use client'

import Link from 'next/link'
import { FaWandMagicSparkles } from 'react-icons/fa6'
import { IoAdd } from 'react-icons/io5'
import { FaBalanceScale } from 'react-icons/fa'
import { FaTrophy } from 'react-icons/fa'
import { FaArrowRight } from 'react-icons/fa'
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
				<div className={styles.ctaWidgets}>
					<Link href="/compare" className={styles.ctaWidget}>
						<div className={styles.ctaIcon}>
							<FaBalanceScale />
						</div>
						<div className={styles.ctaContent}>
							<h3 className={styles.ctaTitle}>Oceń budynki</h3>
							<p className={styles.ctaDescription}>
								Porównaj i oceń wygenerowane budynki
							</p>
							<div className={styles.ctaButton}>
								Rozpocznij
								<FaArrowRight className={styles.ctaButtonIcon} />
							</div>
						</div>
					</Link>
					<Link href="/rankings" className={styles.ctaWidget}>
						<div className={styles.ctaIcon}>
							<FaTrophy />
						</div>
						<div className={styles.ctaContent}>
							<h3 className={styles.ctaTitle}>Rankingi</h3>
							<p className={styles.ctaDescription}>
								Zobacz najlepiej oceniane budynki
							</p>
							<div className={styles.ctaButton}>
								Zobacz
								<FaArrowRight className={styles.ctaButtonIcon} />
							</div>
						</div>
					</Link>
				</div>
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
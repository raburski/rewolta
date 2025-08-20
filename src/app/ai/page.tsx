'use client'

import Link from 'next/link'
import { FaWandMagicSparkles } from 'react-icons/fa6'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import styles from './page.module.css'
import { buildingProducts } from '@/content/ai'

export default function AIProductsPage() {
	return (
		<main className={styles.main}>
			<Header 
				title="AI Generatory"
				subtitle="Wybierz jeden z naszych generatorów AI, aby stworzyć unikalne budynki"
			/>

			<div className={styles.content}>
				<div className={styles.productsGrid}>
					{buildingProducts.map((product) => (
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
			</div>
			
			<Footer />
		</main>
	)
} 
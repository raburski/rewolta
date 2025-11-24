'use client'

import { useBuildingProducts } from '@/lib/hooks/useBuildingProducts'
import styles from './RankingTypeFilter.module.css'

interface RankingTypeFilterProps {
	selectedProductId: string | null
	onProductChange: (productId: string | null) => void
	label?: string
}

export default function RankingTypeFilter({ 
	selectedProductId, 
	onProductChange,
	label = 'Typ rankingu:'
}: RankingTypeFilterProps) {
	const { products } = useBuildingProducts()
	const activeProducts = products.filter(p => p.status === 'ACTIVE')

	const handleGlobalClick = () => {
		onProductChange(null)
	}

	const handleProductClick = (productId: string) => {
		onProductChange(productId)
	}

	return (
		<div className={styles.filterGroup}>
			<label>{label}</label>
			<div className={styles.typeSelector}>
				<button
					className={`${styles.globalButton} ${!selectedProductId ? styles.active : ''}`}
					onClick={handleGlobalClick}
					title="Globalny"
				>
					Globalny
				</button>
				{activeProducts.map(product => (
					<button
						key={product.id}
						className={`${styles.productCard} ${selectedProductId === product.id ? styles.active : ''}`}
						onClick={() => handleProductClick(product.id)}
						title={product.name}
					>
						<img
							src={product.imageUrl}
							alt={product.name}
							className={styles.productThumbnail}
						/>
					</button>
				))}
			</div>
		</div>
	)
}


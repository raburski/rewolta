'use client'

import { useRequireUserCan } from '@raburski/next-auth-permissions/client'
import { Permission } from '@/lib/permissions'
import Layout from '@/app/components/Layout/Layout'
import PageContent from '@/app/components/PageContent/PageContent'
import AIGenerator from '@/app/ai/components/AIGenerator'
import { CUSTOM_PRODUCT_ID } from '@/lib/constants'
import styles from '../[productId]/page.module.css'

export default function CustomAIPage() {
	const { isLoading } = useRequireUserCan(Permission.IMAGE_GENERATION_CUSTOM, '/ai')

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

	return (
		<Layout
			title="AI Generator: Własny budynek"
			subtitle="Użyj własnego obrazu budynku jako źródła"
		>
			<PageContent>
				<div className={styles.generatorContainer}>
					<AIGenerator productId={CUSTOM_PRODUCT_ID} isCustomMode={true} />
				</div>
			</PageContent>
		</Layout>
	)
}


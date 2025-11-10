'use client'

import { useRequireUserCan } from '@raburski/next-auth-permissions/client'
import { Permission } from '@/lib/permissions'
import Layout from '@/app/components/Layout/Layout'
import PageContent from '@/app/components/PageContent/PageContent'
import BuildingsTable from './BuildingsTable'
import styles from './page.module.css'

export default function AdminBuildingsPage() {
	const { isLoading } = useRequireUserCan(Permission.BUILDING_PRODUCTS_MANAGE, '/')

	return (
		<Layout
			title="Generatory budynków"
			subtitle="Zarządzaj generatorami dostępnych budynków"
		>
			<PageContent className={styles.content}>
				{isLoading ? <div className={styles.emptyState}>Ładowanie...</div> : <BuildingsTable />}
			</PageContent>
		</Layout>
	)
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import '@/lib/authUtils'
import { requireUserCan } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import Layout from '@/app/components/Layout/Layout'
import PageContent from '@/app/components/PageContent/PageContent'
import styles from './page.module.css'

export default async function AdminDashboardPage() {
	const { error } = await requireUserCan(Permission.ADMIN_DASHBOARD)

	if (error) {
		redirect('/')
	}

	return (
		<Layout
			title="Panel administracyjny"
			subtitle="Zarządzaj użytkownikami i generatorami budynków"
		>
			<PageContent>
				<div className={styles.container}>
					<p>
						Wybierz sekcję, którą chcesz zarządzać. Dostępne opcje zależą od uprawnień przypisanych do Twojego konta.
					</p>
					<div className={styles.cards}>
						<Link href="/admin/users" className={styles.card}>
							<span className={styles.cardTitle}>Użytkownicy</span>
							<span className={styles.cardDescription}>
								Przeglądaj listę użytkowników, role oraz statusy kont.
							</span>
						</Link>
						<Link href="/admin/buildings" className={styles.card}>
							<span className={styles.cardTitle}>Generatory budynków</span>
							<span className={styles.cardDescription}>
								Zarządzaj generatorami budynków dostępnych dla użytkowników.
							</span>
						</Link>
					</div>
				</div>
			</PageContent>
		</Layout>
	)
}



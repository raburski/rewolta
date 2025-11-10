import { redirect } from 'next/navigation'
import '@/lib/authUtils'
import { requireUserCan } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import Layout from '@/app/components/Layout/Layout'
import PageContent from '@/app/components/PageContent/PageContent'
import UsersTable from './UsersTable'
import styles from './page.module.css'

export default async function AdminUsersPage() {
	const { error } = await requireUserCan(Permission.USERS_VIEW)

	if (error) {
		redirect('/')
	}

	return (
		<Layout
			title="Zarządzanie użytkownikami"
			subtitle="Przeglądaj role, statusy i informacje o użytkownikach"
		>
			<PageContent className={styles.content}>
				<UsersTable />
			</PageContent>
		</Layout>
	)
}



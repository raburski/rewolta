import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import AIGenerator from './AIGenerator'
import styles from './page.module.css'

export default async function MuseumPage() {
	const session = await getServerSession(authOptions)

	if (!session) {
		redirect('/api/auth/signin')
	}

	return (
		<main className={styles.main}>
			<Header 
				title="AI Generator: Museum"
				subtitle="Generuj obrazy z pomocą sztucznej inteligencji"
			>
				<div className={styles.headerActions}>
					<a
						href="/profile"
						className={styles.profileLink}
					>
						<svg className={styles.profileIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						Profil
					</a>
				</div>
			</Header>

			<div className={styles.content}>
				<div className={styles.generatorContainer}>
					<AIGenerator />
				</div>
			</div>
			<Footer />
		</main>
	)
} 
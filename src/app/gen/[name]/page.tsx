import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import styles from './page.module.css'

interface GenPageProps {
	params: {
		name: string
	}
}

export default async function GenPage({ params }: GenPageProps) {
	const session = await getServerSession(authOptions)

	if (!session) {
		redirect('/api/auth/signin')
	}

	return (
		<main className={styles.main}>
			<Header 
				title={`Chroniona zawartość: ${params.name}`}
				subtitle="Dostęp tylko dla uwierzytelnionych użytkowników"
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
				<div className={styles.contentCard}>
					<div className={styles.userWelcome}>
						{session.user?.image && (
							<img 
								src={session.user.image} 
								alt="Profile" 
								className={styles.userAvatar}
							/>
						)}
						<div className={styles.userInfo}>
							<p className={styles.welcomeText}>Witaj, <strong>{session.user?.name}</strong>!</p>
							<p className={styles.userEmail}>{session.user?.email}</p>
						</div>
					</div>
					
					<div className={styles.contentBody}>
						<p>To jest chroniona zawartość dostępna tylko dla uwierzytelnionych użytkowników.</p>
						<p>Parametr trasy: <strong>{params.name}</strong></p>
						
						<div className={styles.sessionInfo}>
							<h3 className={styles.sessionTitle}>Informacje o sesji:</h3>
							<pre className={styles.sessionData}>
								{JSON.stringify(session, null, 2)}
							</pre>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</main>
	)
} 
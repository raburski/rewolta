import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import SignOutButton from './SignOutButton'
import styles from './page.module.css'

export default async function ProfilePage() {
	const session = await getServerSession(authOptions)

	if (!session) {
		redirect('/api/auth/signin')
	}

	return (
		<main className={styles.main}>
			<Header 
				title="Profil użytkownika"
				subtitle="Twoje informacje i ustawienia konta"
			/>

			<div className={styles.content}>
				<div className={styles.profileCard}>
					{/* User Avatar and Basic Info */}
					<div className={styles.userInfo}>
						{session.user?.image ? (
							<img
								src={session.user.image}
								alt="Profile"
								className={styles.avatar}
							/>
						) : (
							<div className={styles.avatarPlaceholder}>
								<svg className={styles.avatarIcon} fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
								</svg>
							</div>
						)}
						<div className={styles.userDetails}>
							<h2 className={styles.userName}>
								{session.user?.name || 'Unknown User'}
							</h2>
							<p className={styles.userEmail}>{session.user?.email}</p>
							{session.user?.id && (
								<p className={styles.userId}>ID: {session.user.id}</p>
							)}
						</div>
					</div>

					{/* Profile Details */}
					<div className={styles.detailsGrid}>
						{/* Personal Information */}
						<div className={styles.detailCard}>
							<h3 className={styles.detailTitle}>Informacje osobiste</h3>
							<dl className={styles.detailList}>
								<div className={styles.detailItem}>
									<dt className={styles.detailLabel}>Imię i nazwisko</dt>
									<dd className={styles.detailValue}>{session.user?.name || 'Nie podano'}</dd>
								</div>
								<div className={styles.detailItem}>
									<dt className={styles.detailLabel}>Email</dt>
									<dd className={styles.detailValue}>{session.user?.email || 'Nie podano'}</dd>
								</div>
								<div className={styles.detailItem}>
									<dt className={styles.detailLabel}>ID użytkownika</dt>
									<dd className={styles.detailValue}>{session.user?.id || 'Nie dostępne'}</dd>
								</div>
							</dl>
						</div>

						{/* Session Information */}
						<div className={styles.detailCard}>
							<h3 className={styles.detailTitle}>Informacje o sesji</h3>
							<dl className={styles.detailList}>
								<div className={styles.detailItem}>
									<dt className={styles.detailLabel}>Dostawca</dt>
									<dd className={styles.detailValue}>
										{session.provider || 'Nieznany'}
									</dd>
								</div>
								<div className={styles.detailItem}>
									<dt className={styles.detailLabel}>Sesja wygasa</dt>
									<dd className={styles.detailValue}>
										{session.expires ? new Date(session.expires).toLocaleString('pl-PL') : 'Nieznane'}
									</dd>
								</div>
							</dl>
						</div>
					</div>

					{/* Raw Session Data (Development Only) */}
					{process.env.NODE_ENV === 'development' && (
						<div className={styles.debugSection}>
							<h3 className={styles.debugTitle}>Surowe dane sesji (tylko dev)</h3>
							<div className={styles.debugContainer}>
								<pre className={styles.debugData}>
									{JSON.stringify(session, null, 2)}
								</pre>
							</div>
						</div>
					)}

					{/* Actions */}
					<div className={styles.actions}>
						<SignOutButton />
					</div>
				</div>
			</div>
			<Footer />
		</main>
	)
} 
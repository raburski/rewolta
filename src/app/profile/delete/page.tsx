import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import DeleteProfileButton from './DeleteProfileButton'
import styles from './page.module.css'

export default async function DeleteProfilePage() {
	const session = await auth()

	if (!session) {
		redirect('/api/auth/signin')
	}

	return (
		<main className={styles.main}>
			<Header 
				title="Usuń konto"
				subtitle="Trwałe usunięcie konta użytkownika"
			/>

			<div className={styles.content}>
				<div className={styles.deleteCard}>
					<div className={styles.warningIcon}>
						<svg className={styles.icon} fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
						</svg>
					</div>

					<h2 className={styles.title}>Usuń konto</h2>
					
					<div className={styles.warningMessage}>
						<p className={styles.description}>
							Ta operacja jest <strong>nieodwracalna</strong>. Po usunięciu konta:
						</p>
						<ul className={styles.consequencesList}>
							<li>Wszystkie Twoje wygenerowane obrazy zostaną trwale usunięte</li>
							<li>Stracisz dostęp do swojego konta i historii</li>
							<li>Nie będzie możliwości odzyskania danych</li>
							<li>Zostaniesz automatycznie wylogowany</li>
						</ul>
					</div>

					<div className={styles.userInfo}>
						<p className={styles.userDetails}>
							<span className={styles.label}>Użytkownik:</span>
							<span className={styles.value}>{session.user?.name || session.user?.email}</span>
						</p>
					</div>

					<div className={styles.actions}>
						<DeleteProfileButton />
					</div>
				</div>
			</div>
			<Footer />
		</main>
	)
}

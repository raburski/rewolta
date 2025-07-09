import Link from 'next/link'
import { getAllContests } from '@/lib/markdown'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import styles from './page.module.css'

export default function ContestPage() {
	const contests = getAllContests()

	const activeContests = contests.filter(contest => contest.status === 'active')
	const upcomingContests = contests.filter(contest => contest.status === 'upcoming')
	const pastContests = contests.filter(contest => contest.status === 'past')

	return (
		<main className={styles.main}>
			<Header 
				title="Konkursy Rewolty"
				subtitle="Dołącz do naszych konkursów i pokaż swój talent!"
			/>

			<div className={styles.content}>
				{activeContests.length > 0 && (
					<section className={styles.section}>
						<h2>🎯 Aktywne Konkursy</h2>
						<div className={styles.contestGrid}>
							{activeContests.map((contest) => (
								<Link key={contest.id} href={`/contest/${contest.id}`} className={styles.contestCard}>
									<div className={styles.contestHeader}>
										<h3>{contest.title}</h3>
										<span className={styles.statusActive}>Aktywny</span>
									</div>
									<p>{contest.description}</p>
									<div className={styles.contestMeta}>
										<span>📅 {contest.startDate} - {contest.endDate}</span>
									</div>
								</Link>
							))}
						</div>
					</section>
				)}

				{upcomingContests.length > 0 && (
					<section className={styles.section}>
						<h2>⏰ Nadchodzące Konkursy</h2>
						<div className={styles.contestGrid}>
							{upcomingContests.map((contest) => (
								<Link key={contest.id} href={`/contest/${contest.id}`} className={styles.contestCard}>
									<div className={styles.contestHeader}>
										<h3>{contest.title}</h3>
										<span className={styles.statusUpcoming}>Wkrótce</span>
									</div>
									<p>{contest.description}</p>
									<div className={styles.contestMeta}>
										<span>📅 {contest.startDate} - {contest.endDate}</span>
									</div>
								</Link>
							))}
						</div>
					</section>
				)}

				{pastContests.length > 0 && (
					<section className={styles.section}>
						<h2>📚 Zakończone Konkursy</h2>
						<div className={styles.contestGrid}>
							{pastContests.map((contest) => (
								<Link key={contest.id} href={`/contest/${contest.id}`} className={styles.contestCard}>
									<div className={styles.contestHeader}>
										<h3>{contest.title}</h3>
										<span className={styles.statusPast}>Zakończony</span>
									</div>
									<p>{contest.description}</p>
									<div className={styles.contestMeta}>
										<span>📅 {contest.startDate} - {contest.endDate}</span>
									</div>
								</Link>
							))}
						</div>
					</section>
				)}

				{contests.length === 0 && (
					<div className={styles.emptyState}>
						<h2>Brak konkursów</h2>
						<p>W tej chwili nie ma żadnych aktywnych konkursów. Sprawdź ponownie wkrótce!</p>
					</div>
				)}
			</div>
			<Footer />
		</main>
	)
} 
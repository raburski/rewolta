import Link from 'next/link'
import { getContestData, getContestContent, getAllContestIds } from '@/lib/markdown'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import styles from './page.module.css'

export async function generateStaticParams() {
	const contests = getAllContestIds()
	return contests
}

export default async function ContestDetailPage({ params }: { params: { name: string } }) {
	const contest = getContestData(params.name)
	const content = await getContestContent(params.name)

	return (
		<main className={styles.main}>
			<Header title={contest.title} subtitle={contest.description} />

			<div className={styles.content}>
				<article className={styles.article}>
					<div 
						className={styles.articleContent}
						dangerouslySetInnerHTML={{ __html: content }}
					/>
				</article>

				<aside className={styles.sidebar}>
					{contest.image && (
						<div className={styles.contestImage}>
							<img 
								src={contest.image} 
								alt={`Zdjęcie konkursu: ${contest.title}`}
								className={styles.thumbnail}
							/>
						</div>
					)}
					<div className={styles.contestInfo}>
						<h3>Informacje o konkursie</h3>
						<div className={styles.infoItem}>
							<strong>Status:</strong>
							<span className={`${styles.status} ${styles[`status${contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}`]}`}>
								{contest.status === 'active' ? 'Aktywny' : contest.status === 'upcoming' ? 'Wkrótce' : 'Zakończony'}
							</span>
						</div>
						<div className={styles.infoItem}>
							<strong>Data rozpoczęcia:</strong>
							<span>{contest.startDate}</span>
						</div>
						<div className={styles.infoItem}>
							<strong>Data zakończenia:</strong>
							<span>{contest.endDate}</span>
						</div>
						{contest.facebookPost && (
							<div className={styles.facebookButton}>
								<a 
									href={contest.facebookPost} 
									target="_blank" 
									rel="noopener noreferrer"
									className={styles.facebookLink}
								>
									<span className={styles.facebookIcon} aria-hidden="true">
										<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
											<path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/>
										</svg>
									</span>
									<span style={{ marginLeft: '0.5em' }}>Zobacz post na FB</span>
								</a>
							</div>
						)}
						{contest.email && (
							<div className={styles.emailButton}>
								<a 
									href={`mailto:${contest.email}${contest.emailSubject ? `?subject=${encodeURIComponent(contest.emailSubject)}` : ''}`}
									className={styles.emailLink}
								>
									<span className={styles.emailIcon} aria-hidden="true">
										<svg width="32" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
											<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
										</svg>
									</span>
									<span style={{ marginLeft: '0.16em' }}>Kontakt mailowy</span>
								</a>
							</div>
						)}
					</div>
				</aside>
			</div>
			<Footer />
		</main>
	)
} 
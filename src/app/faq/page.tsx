import Link from 'next/link'
import { getAllFaqs, getFaqsByCategory } from '@/lib/faq'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import styles from './page.module.css'

export default function FaqPage() {
	const allFaqs = getAllFaqs()
	const faqsByCategory = getFaqsByCategory()

	const categoryNames: Record<string, string> = {
		general: 'Ogólne',
		membership: 'Członkostwo',
		guidelines: 'Zasady i wytyczne'
	}

	return (
		<main className={styles.main}>
			<Header 
				title="Często Zadawane Pytania"
				subtitle="Znajdź odpowiedzi na najczęściej zadawane pytania o Architektoniczną Rewoltę"
			/>

			<div className={styles.content}>
				{Object.entries(faqsByCategory).map(([category, faqs]) => (
					<section key={category} className={styles.categorySection}>
						<h2 className={styles.categoryTitle}>
							{categoryNames[category] || category}
						</h2>
						<div className={styles.faqList}>
							{faqs.map((faq) => (
								<Link key={faq.id} href={`/faq/${faq.id}`} className={styles.faqItem}>
									<h3 className={styles.faqTitle}>{faq.title}</h3>
									<span className={styles.faqArrow}>→</span>
								</Link>
							))}
						</div>
					</section>
				))}

				{allFaqs.length === 0 && (
					<div className={styles.emptyState}>
						<h2>Brak pytań</h2>
						<p>W tej chwili nie ma żadnych pytań w FAQ. Sprawdź ponownie wkrótce!</p>
					</div>
				)}
			</div>
			<Footer />
		</main>
	)
} 
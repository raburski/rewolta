import Link from 'next/link'
import { getFaqData, getFaqContent, getAllFaqIds, getAllFaqs } from '@/lib/faq'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import MarkdownContent from '@/app/components/MarkdownContent/MarkdownContent'
import styles from './page.module.css'

export async function generateStaticParams() {
	const faqs = getAllFaqIds()
	return faqs
}

export default async function FaqDetailPage({ params }: { params: { slug: string } }) {
	const faq = getFaqData(params.slug)
	const content = await getFaqContent(params.slug)
	const allFaqs = getAllFaqs()

	const categoryNames: Record<string, string> = {
		general: 'Ogólne',
		membership: 'Członkostwo',
		guidelines: 'Zasady i wytyczne'
	}

	return (
		<main className={styles.main}>
			<Header title={faq.title} subtitle={categoryNames[faq.category] || faq.category} />

			<div className={styles.content}>
				<nav className={styles.breadcrumb}>
					<Link href="/faq" className={styles.breadcrumbLink}>
						← Wróć do wszystkich pytań
					</Link>
				</nav>

				<div className={styles.mainContent}>
					<article className={styles.article}>
						<div className={styles.featuredQuestion}>
							<h1 className={styles.questionTitle}>{faq.title}</h1>
							{faq.image && (
								<div className={styles.questionImage}>
									<img 
										src={faq.image} 
										alt={`Ilustracja do pytania: ${faq.title}`}
										className={styles.image}
									/>
								</div>
							)}
							<MarkdownContent 
								content={content}
								className={styles.articleContent}
							/>
						</div>
					</article>

					<aside className={styles.sidebar}>
						<div className={styles.otherQuestionsSection}>
							<h3 className={styles.sidebarTitle}>Inne pytania</h3>
							<div className={styles.otherQuestionsList}>
								{allFaqs
									.filter(otherFaq => otherFaq.id !== faq.id)
									.map((otherFaq) => (
										<Link key={otherFaq.id} href={`/faq/${otherFaq.id}`} className={styles.otherQuestionItem}>
											<h4 className={styles.otherQuestionTitle}>{otherFaq.title}</h4>
											<span className={styles.categoryTag}>
												{categoryNames[otherFaq.category] || otherFaq.category}
											</span>
										</Link>
									))}
							</div>
						</div>
					</aside>
				</div>
			</div>
			<Footer />
		</main>
	)
} 
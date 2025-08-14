import { getMarkdownContent } from '@/lib/markdown'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import MarkdownContent from '@/app/components/MarkdownContent/MarkdownContent'
import styles from './page.module.css'

export default async function TermsPage() {
	const content = await getMarkdownContent('terms')

	return (
		<main className={styles.main}>
			<Header 
				title="Regulamin Serwisu"
				subtitle="Zasady korzystania z serwisu Rewolta"
			/>

			<div className={styles.content}>
				<div className={styles.contentContainer}>
					<MarkdownContent content={content} />
				</div>
			</div>
			<Footer />
		</main>
	)
} 
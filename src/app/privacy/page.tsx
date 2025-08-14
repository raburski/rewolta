import { getMarkdownContent } from '@/lib/markdown'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import MarkdownContent from '@/app/components/MarkdownContent/MarkdownContent'
import styles from './page.module.css'

export default async function PrivacyPage() {
	const content = await getMarkdownContent('privacy')

	return (
		<main className={styles.main}>
			<Header 
				title="Polityka Prywatności"
				subtitle="Zasady przetwarzania i ochrony danych osobowych"
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
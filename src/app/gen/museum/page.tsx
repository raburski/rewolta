import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import AIGenerator from './AIGenerator'
import styles from './page.module.css'

export default async function MuseumPage() {
	const session = await getServerSession(authOptions)

	// if (!session) {
	// 	redirect('/api/auth/signin')
	// }

	return (
		<main className={styles.main}>
			<Header 
				title="AI Generator: Museum"
				subtitle="Generuj obrazy z pomocą sztucznej inteligencji"
			/>

			<div className={styles.content}>
				<div className={styles.generatorContainer}>
					<AIGenerator />
				</div>
			</div>
			<Footer />
		</main>
	)
} 
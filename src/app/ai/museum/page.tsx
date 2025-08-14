import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import AIGenerator from './AIGenerator'
import styles from './page.module.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'AI Generator: Museum - Architektoniczna Rewolta',
	description: 'Generuj obrazy z pomocą sztucznej inteligencji.',
	openGraph: {
		title: 'AI Generator: Museum',
		description: 'Generuj obrazy z pomocą sztucznej inteligencji.',
		type: 'website',
		url: 'https://rewolta.org/ai/museum',
		images: [
			{
				url: 'https://rewolta.org/assets/museum-small.png',
				width: 768,
				height: 512,
				alt: 'Muzeum Narodowe we Wrocławiu - inspiracja dla AI Generatora',
			},
		],
		siteName: 'Architektoniczna Rewolta',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'AI Generator: Museum',
		description: 'Generuj obrazy z pomocą sztucznej inteligencji.',
		images: ['https://rewolta.org/assets/museum-small.png'],
	},
}

export default async function MuseumPage() {
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
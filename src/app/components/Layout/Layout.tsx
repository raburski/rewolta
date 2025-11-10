import Header from '@/app/components/Header/Header'
import Footer from '@/app/components/Footer/Footer'
import styles from './Layout.module.css'

interface LayoutProps {
	title: string
	subtitle?: string
	children: React.ReactNode
}

export default function Layout({ title, subtitle, children }: LayoutProps) {
	return (
		<main className={styles.main}>
			<Header title={title} subtitle={subtitle} />
			<div className={styles.content}>
				{children}
			</div>
			<Footer />
		</main>
	)
}


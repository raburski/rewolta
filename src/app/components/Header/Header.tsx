import Link from 'next/link'
import Image from 'next/image'
import styles from './Header.module.css'

interface HeaderProps {
	title?: string
	subtitle?: string
	children?: React.ReactNode
}

export default function Header({ title = 'Architektoniczna Rewolta', subtitle, children }: HeaderProps) {
	return (
		<header className={styles.siteHeader}>
			<div className={styles.headerTop}>
				{title && (
					<div className={styles.pageInfo}>
						<Link href="/" className={styles.logoLink}>
							<Image
								src="/emblem/polska.png"
								alt="Architektoniczna Rewolta"
								width={48}
								height={48}
								className={styles.logo}
							/>
						</Link>
						<div className={styles.titleGroup}>
							<h1 className={styles.pageTitle}>{title}</h1>
							{subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
						</div>
					</div>
				)}
				{children && (
					<div className={styles.headerActions}>
						{children}
					</div>
				)}
			</div>
		</header>
	)
} 
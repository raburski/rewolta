'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signIn } from 'next-auth/react'
import { MdLogin } from 'react-icons/md'
import styles from './Header.module.css'

interface HeaderProps {
	title?: string
	subtitle?: string
	children?: React.ReactNode
}

export default function Header({ title = 'Architektoniczna Rewolta', subtitle, children }: HeaderProps) {
	const { data: session, status } = useSession()
	const isAuthenticated = status === 'authenticated'

	const handleSignIn = () => {
		signIn('google', { callbackUrl: window.location.href })
	}

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
				<div className={styles.headerActions}>
					{children}
					{!isAuthenticated && status !== 'loading' && (
						<button
							onClick={handleSignIn}
							className={styles.signInButton}
						>
							<MdLogin className={styles.signInIcon} />
							Zaloguj się
						</button>
					)}
				</div>
			</div>
		</header>
	)
} 
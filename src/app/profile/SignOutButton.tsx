'use client'

import { signOut } from 'next-auth/react'
import styles from './SignOutButton.module.css'

export default function SignOutButton() {
	return (
		<button
			onClick={() => signOut({ callbackUrl: '/' })}
			className={styles.signOutButton}
		>
			<svg className={styles.signOutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
			</svg>
			Wyloguj się
		</button>
	)
} 
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import styles from './page.module.css'

export default function UserIdPage() {
	const { data: session, status } = useSession()
	const router = useRouter()

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/auth/signin')
		}
	}, [status, router])

	if (status === 'loading') {
		return (
			<div className={styles.container}>
				<div className={styles.loadingCard}>
					<p>Ładowanie...</p>
				</div>
			</div>
		)
	}

	if (status === 'unauthenticated') {
		return null
	}

	const userId = session?.user?.id || session?.user?.email || 'unknown'

	return (
		<div className={styles.container}>
			<div className={styles.userIdCard}>
				<h1 className={styles.title}>Twój ID użytkownika</h1>
				<div className={styles.idContainer}>
					<code className={styles.userId}>{userId}</code>
				</div>
				<p className={styles.description}>
					Ten identyfikator jest używany do śledzenia Twoich generowań i kredytów.
				</p>
			</div>
		</div>
	)
} 
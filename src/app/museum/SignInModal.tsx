'use client'

import { signIn } from 'next-auth/react'
import { FaFacebook } from 'react-icons/fa6'
import { FaDiscord } from 'react-icons/fa6'
import styles from './SignInModal.module.css'

interface SignInModalProps {
	isOpen: boolean
	onClose: () => void
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
	if (!isOpen) return null

	const isDevelopment = process.env.NODE_ENV === 'development'

	const handleFacebookLogin = () => {
		signIn('facebook', { callbackUrl: '/museum' })
	}

	const handleDiscordLogin = () => {
		signIn('discord', { callbackUrl: '/museum' })
	}

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h2 className={styles.modalTitle}>Zaloguj się</h2>
					<button className={styles.closeButton} onClick={onClose}>
						×
					</button>
				</div>
				<div className={styles.modalBody}>
					<p className={styles.modalDescription}>
						Zaloguj się, aby korzystać z generatora AI
					</p>
					<div className={styles.buttonContainer}>
						<button className={styles.facebookButton} onClick={handleFacebookLogin}>
							<FaFacebook className={styles.facebookIcon} />
							Zaloguj przez Facebook
						</button>
						{isDevelopment && (
							<button className={styles.discordButton} onClick={handleDiscordLogin}>
								<FaDiscord className={styles.discordIcon} />
								Zaloguj przez Discord (Dev Only)
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
} 
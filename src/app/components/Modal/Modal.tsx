'use client'

import { type MouseEvent, type ReactNode } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
	title: string
	subtitle?: string
	onClose: () => void
	children: ReactNode
}

export default function Modal({ title, subtitle, onClose, children }: ModalProps) {
	const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) {
			onClose()
		}
	}

	return (
		<div className={styles.overlay} onClick={handleOverlayClick} role="presentation">
			<div
				className={styles.modal}
				role="dialog"
				aria-modal="true"
				aria-label={title}
			>
				<header className={styles.header}>
					<div className={styles.titleGroup}>
						<h3 className={styles.title}>
							{title}
						</h3>
						{subtitle ? (
							<p className={styles.subtitle}>{subtitle}</p>
						) : null}
					</div>
					<button
						type="button"
						className={styles.closeButton}
						onClick={onClose}
						aria-label="Zamknij modal"
					>
						X
					</button>
				</header>
				<div className={styles.body}>{children}</div>
			</div>
		</div>
	)
}


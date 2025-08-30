'use client'

import { useEffect } from 'react'
import styles from './DeleteConfirmModal.module.css'

interface DeleteConfirmModalProps {
	onConfirm: () => void
	onCancel: () => void
	isDeleting: boolean
}

export default function DeleteConfirmModal({ onConfirm, onCancel, isDeleting }: DeleteConfirmModalProps) {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && !isDeleting) {
				onCancel()
			}
		}

		document.addEventListener('keydown', handleEscape)
		document.body.style.overflow = 'hidden'

		return () => {
			document.removeEventListener('keydown', handleEscape)
			document.body.style.overflow = 'unset'
		}
	}, [onCancel, isDeleting])

	return (
		<div className={styles.overlay} onClick={!isDeleting ? onCancel : undefined}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<div className={styles.header}>
					<div className={styles.warningIcon}>
						<svg className={styles.icon} fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
						</svg>
					</div>
					<h3 className={styles.title}>Potwierdzenie usunięcia konta</h3>
				</div>

				<div className={styles.content}>
					<p className={styles.mainWarning}>
						Czy na pewno chcesz <strong>trwale usunąć</strong> swoje konto?
					</p>
					
					<div className={styles.warningBox}>
						<h4 className={styles.warningTitle}>Co zostanie usunięte:</h4>
						<ul className={styles.warningList}>
							<li>Wszystkie Twoje wygenerowane obrazy</li>
							<li>Historia generowania</li>
							<li>Dane konta i preferencje</li>
							<li>Wszystkie powiązane z kontem informacje</li>
						</ul>
					</div>

					<div className={styles.finalWarning}>
						<strong>Ta operacja jest nieodwracalna!</strong>
						<br />
						Po usunięciu konta nie będzie możliwości odzyskania danych.
					</div>
				</div>

				<div className={styles.actions}>
					<button
						onClick={onCancel}
						className={styles.cancelButton}
						disabled={isDeleting}
					>
						Anuluj
					</button>
					<button
						onClick={onConfirm}
						className={styles.confirmButton}
						disabled={isDeleting}
					>
						{isDeleting ? (
							<>
								<div className={styles.spinner} />
								Usuwanie...
							</>
						) : (
							<>
								<svg className={styles.deleteIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
								Tak, usuń konto
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	)
}

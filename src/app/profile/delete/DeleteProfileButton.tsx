'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import DeleteConfirmModal from './DeleteConfirmModal'
import styles from './DeleteProfileButton.module.css'

export default function DeleteProfileButton() {
	const [showModal, setShowModal] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDeleteClick = () => {
		setShowModal(true)
	}

	const handleDeleteConfirm = async () => {
		setIsDeleting(true)
		try {
			const response = await fetch('/api/user/delete', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Nie udało się usunąć konta')
			}

			// Account deleted successfully, sign out
			await signOut({ callbackUrl: '/' })
		} catch (error) {
			console.error('Error deleting account:', error)
			alert('Wystąpił błąd podczas usuwania konta. Spróbuj ponownie.')
		} finally {
			setIsDeleting(false)
			setShowModal(false)
		}
	}

	const handleCancel = () => {
		setShowModal(false)
	}

	return (
		<>
			<button
				onClick={handleDeleteClick}
				className={styles.deleteButton}
				disabled={isDeleting}
			>
				<svg className={styles.deleteIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
				</svg>
				{isDeleting ? 'Usuwanie...' : 'Usuń konto'}
			</button>

			<a href="/profile" className={styles.cancelLink}>
				Anuluj i wróć do profilu
			</a>

			{showModal && (
				<DeleteConfirmModal
					onConfirm={handleDeleteConfirm}
					onCancel={handleCancel}
					isDeleting={isDeleting}
				/>
			)}
		</>
	)
}

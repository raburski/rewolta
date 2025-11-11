'use client'

import { useState } from 'react'
import { useUserCan } from '@/lib/hooks/useUserCan'
import { Permission } from '@/lib/permissions'
import Modal from '@/app/components/Modal/Modal'
import styles from './page.module.css'

export default function CreditsManager() {
	const canSetCredits = useUserCan(Permission.USERS_SET_CREDITS)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [credits, setCredits] = useState<number>(0)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	if (!canSetCredits) {
		return null
	}

	const handleOpenModal = () => {
		setIsModalOpen(true)
		setCredits(0)
		setError(null)
		setSuccess(false)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setError(null)
		setSuccess(false)
	}

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()

		try {
			setSaving(true)
			setError(null)
			setSuccess(false)

			const response = await fetch('/api/admin/credits', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ credits })
			})

			if (!response.ok) {
				const body = await response.json().catch(() => null)
				throw new Error(body?.error || 'Nie udało się zaktualizować kredytów')
			}

			setSuccess(true)
			setTimeout(() => {
				handleCloseModal()
			}, 1500)
		} catch (submitError) {
			setError(submitError instanceof Error ? submitError.message : 'Wystąpił błąd podczas zapisu')
		} finally {
			setSaving(false)
		}
	}

	return (
		<>
			<button
				type="button"
				className={styles.creditsButton}
				onClick={handleOpenModal}
			>
				<span className={styles.cardTitle}>Zarządzaj kredytami</span>
				<span className={styles.cardDescription}>
					Ustaw kredyty dla wszystkich użytkowników.
				</span>
			</button>

			{isModalOpen && (
				<Modal
					title="Ustaw kredyty dla wszystkich użytkowników"
					subtitle="Ta operacja ustawi tę samą liczbę kredytów dla wszystkich użytkowników"
					onClose={handleCloseModal}
				>
					<form className={styles.modalForm} onSubmit={handleSubmit}>
						<label className={styles.modalLabel}>
							Liczba kredytów
							<input
								type="number"
								className={styles.modalInput}
								value={credits}
								onChange={(event) => setCredits(Number(event.target.value))}
								min="0"
								step="1"
								required
							/>
						</label>

						{error ? <p className={styles.modalError}>{error}</p> : null}
						{success ? <p className={styles.modalSuccess}>Kredyty zostały zaktualizowane!</p> : null}

						<div className={styles.modalActions}>
							<button
								type="button"
								className={styles.modalSecondaryButton}
								onClick={handleCloseModal}
								disabled={saving}
							>
								Anuluj
							</button>
							<button
								type="submit"
								className={styles.modalButton}
								disabled={saving}
							>
								{saving ? 'Zapisywanie...' : 'Zapisz'}
							</button>
						</div>
					</form>
				</Modal>
			)}
		</>
	)
}


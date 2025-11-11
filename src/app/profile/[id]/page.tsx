'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useUserCan } from '@raburski/next-auth-permissions/client'
import { Permission } from '@/lib/permissions'
import Layout from '@/app/components/Layout/Layout'
import PageContent from '@/app/components/PageContent/PageContent'
import Modal from '@/app/components/Modal/Modal'
import { UserRole, UserStatus } from '@prisma/client'
import styles from './page.module.css'

type UserData = {
	id: string
	name: string | null
	email: string | null
	image: string | null
	role: UserRole
	status: UserStatus
	createdAt: string
	updatedAt: string
}

const roleOptions: UserRole[] = ['USER', 'MODERATOR', 'ADMIN']
const statusOptions: UserStatus[] = ['ACTIVE', 'BANNED', 'DELETED']

function statusBadgeClass(status: UserStatus) {
	switch (status) {
		case 'ACTIVE':
			return `${styles.badge} ${styles.badgeActive}`
		case 'BANNED':
		case 'DELETED':
			return `${styles.badge} ${styles.badgeBanned}`
		default:
			return `${styles.badge} ${styles.badgePending}`
	}
}

export default function UserProfilePage() {
	const params = useParams()
	const { data: session } = useSession()
	const userId = params?.id as string
	const canManage = useUserCan(Permission.USERS_MANAGE)
	const canViewUsers = useUserCan(Permission.USERS_VIEW)
	const canSetCredits = useUserCan(Permission.USERS_SET_CREDITS)
	
	const [user, setUser] = useState<UserData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false)
	const [editRole, setEditRole] = useState<UserRole>('USER')
	const [editStatus, setEditStatus] = useState<UserStatus>('ACTIVE')
	const [credits, setCredits] = useState<number | null>(null)
	const [editCredits, setEditCredits] = useState<number>(0)
	const [creditsLoading, setCreditsLoading] = useState(false)
	const [saving, setSaving] = useState(false)
	const [saveError, setSaveError] = useState<string | null>(null)
	const [creditsSaveError, setCreditsSaveError] = useState<string | null>(null)
	const [savingCredits, setSavingCredits] = useState(false)

	const isOwner = session?.user?.id === userId

	useEffect(() => {
		if (!userId) {
			return
		}

		const fetchUser = async () => {
			try {
				setLoading(true)
				setError(null)
				const response = await fetch(`/api/user/${userId}`)
				
				if (!response.ok) {
					if (response.status === 404) {
						throw new Error('Użytkownik nie został znaleziony')
					}
					throw new Error('Nie udało się pobrać danych użytkownika')
				}

				const data = await response.json()
				setUser(data.user)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Wystąpił błąd')
			} finally {
				setLoading(false)
			}
		}

		fetchUser()
	}, [userId])

	// Fetch credits if user has USERS_VIEW permission
	useEffect(() => {
		if (!userId || !canViewUsers || !user) {
			return
		}

		const fetchCredits = async () => {
			try {
				setCreditsLoading(true)
				const response = await fetch(`/api/user/${userId}/credits`)
				
				if (!response.ok) {
					console.error('Failed to fetch credits')
					return
				}

				const data = await response.json()
				setCredits(data.credits || 0)
			} catch (err) {
				console.error('Error fetching credits:', err)
			} finally {
				setCreditsLoading(false)
			}
		}

		fetchCredits()
	}, [userId, canViewUsers, user])

	const handleRoleClick = () => {
		if (!canManage || !user) {
			return
		}
		setEditRole(user.role)
		setEditStatus(user.status)
		setSaveError(null)
		setIsModalOpen(true)
	}

	const handleCreditsClick = () => {
		if (!canSetCredits || credits === null) {
			return
		}
		setEditCredits(credits)
		setCreditsSaveError(null)
		setIsCreditsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
		setSaveError(null)
	}

	const closeCreditsModal = () => {
		setIsCreditsModalOpen(false)
		setCreditsSaveError(null)
	}

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()

		if (!user) {
			return
		}

		try {
			setSaving(true)
			setSaveError(null)

			const response = await fetch(`/api/admin/users/${user.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					role: editRole,
					status: editStatus
				})
			})

			if (!response.ok) {
				const body = await response.json().catch(() => null)
				throw new Error(body?.error || 'Nie udało się zapisać zmian')
			}

			const data = await response.json()
			setUser(data.user)
			closeModal()
		} catch (submitError) {
			setSaveError(submitError instanceof Error ? submitError.message : 'Wystąpił błąd podczas zapisu')
		} finally {
			setSaving(false)
		}
	}

	const handleCreditsSubmit = async (event: React.FormEvent) => {
		event.preventDefault()

		if (!user || credits === null) {
			return
		}

		try {
			setSavingCredits(true)
			setCreditsSaveError(null)

			const response = await fetch(`/api/user/${user.id}/credits`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					credits: editCredits
				})
			})

			if (!response.ok) {
				const body = await response.json().catch(() => null)
				throw new Error(body?.error || 'Nie udało się zapisać zmian')
			}

			const data = await response.json()
			setCredits(data.credits)
			closeCreditsModal()
		} catch (submitError) {
			setCreditsSaveError(submitError instanceof Error ? submitError.message : 'Wystąpił błąd podczas zapisu')
		} finally {
			setSavingCredits(false)
		}
	}

	if (loading) {
		return (
			<Layout title="Profil użytkownika" subtitle="Ładowanie...">
				<PageContent>
					<div className={styles.loading}>Ładowanie danych użytkownika...</div>
				</PageContent>
			</Layout>
		)
	}

	if (error || !user) {
		return (
			<Layout title="Profil użytkownika" subtitle="Błąd">
				<PageContent>
					<div className={styles.error}>{error || 'Nie udało się załadować profilu'}</div>
				</PageContent>
			</Layout>
		)
	}

	return (
		<>
			<Layout 
				title="Profil użytkownika" 
				subtitle={user.name || user.email || 'Użytkownik'}
			>
				<PageContent>
					<div className={styles.profileCard}>
						<div className={styles.userInfo}>
							{user.image ? (
								<img
									src={user.image}
									alt="Profile"
									className={styles.avatar}
								/>
							) : (
								<div className={styles.avatarPlaceholder}>
									<svg className={styles.avatarIcon} fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
									</svg>
								</div>
							)}
							<div className={styles.userDetails}>
								<h2 className={styles.userName}>
									{user.name || 'Unknown User'}
								</h2>
								{user.email && (
									<p className={styles.userEmail}>{user.email}</p>
								)}
								{user.id && (
									<p className={styles.userId}>ID: {user.id}</p>
								)}
							</div>
						</div>

						<div className={styles.detailsGrid}>
							<div className={styles.detailCard}>
								<h3 className={styles.detailTitle}>Informacje</h3>
								<dl className={styles.detailList}>
									<div className={styles.detailItem}>
										<dt className={styles.detailLabel}>Imię i nazwisko</dt>
										<dd className={styles.detailValue}>{user.name || 'Nie podano'}</dd>
									</div>
									{user.email && (
										<div className={styles.detailItem}>
											<dt className={styles.detailLabel}>Email</dt>
											<dd className={styles.detailValue}>{user.email}</dd>
										</div>
									)}
									<div className={styles.detailItem}>
										<dt className={styles.detailLabel}>ID użytkownika</dt>
										<dd className={styles.detailValue}>{user.id}</dd>
									</div>
									<div className={styles.detailItem}>
										<dt className={styles.detailLabel}>Rola</dt>
										<dd className={styles.detailValue}>
											{canManage ? (
												<button
													type="button"
													className={styles.editableRole}
													onClick={handleRoleClick}
												>
													{user.role}
												</button>
											) : (
												user.role
											)}
										</dd>
									</div>
									<div className={styles.detailItem}>
										<dt className={styles.detailLabel}>Status</dt>
										<dd className={styles.detailValue}>
											<span className={statusBadgeClass(user.status)}>
												{user.status}
											</span>
										</dd>
									</div>
									<div className={styles.detailItem}>
										<dt className={styles.detailLabel}>Dołączył</dt>
										<dd className={styles.detailValue}>
											{new Date(user.createdAt).toLocaleString('pl-PL')}
										</dd>
									</div>
									{canViewUsers && (
										<div className={styles.detailItem}>
											<dt className={styles.detailLabel}>Kredyty</dt>
											<dd className={styles.detailValue}>
												{creditsLoading ? (
													<span>Ładowanie...</span>
												) : credits !== null ? (
													canSetCredits ? (
														<button
															type="button"
															className={styles.editableCredits}
															onClick={handleCreditsClick}
														>
															{credits}
														</button>
													) : (
														<span>{credits}</span>
													)
												) : (
													<span>—</span>
												)}
											</dd>
										</div>
									)}
								</dl>
							</div>
						</div>
					</div>
				</PageContent>
			</Layout>

			{isModalOpen && user && canManage ? (
				<Modal
					title="Edytuj użytkownika"
					subtitle={user.name || user.email || 'Użytkownik'}
					onClose={closeModal}
				>
					<form className={styles.modalForm} onSubmit={handleSubmit}>
						<label className={styles.modalLabel}>
							Rola
							<select
								className={styles.modalSelect}
								value={editRole}
								onChange={(event) => setEditRole(event.target.value as UserRole)}
							>
								{roleOptions.map((role) => (
									<option key={role} value={role}>
										{role}
									</option>
								))}
							</select>
						</label>

						<label className={styles.modalLabel}>
							Status
							<select
								className={styles.modalSelect}
								value={editStatus}
								onChange={(event) => setEditStatus(event.target.value as UserStatus)}
							>
								{statusOptions.map((status) => (
									<option key={status} value={status}>
										{status}
									</option>
								))}
							</select>
						</label>

						{saveError ? <p className={styles.modalError}>{saveError}</p> : null}

						<div className={styles.modalActions}>
							<button
								type="button"
								className={styles.modalSecondaryButton}
								onClick={closeModal}
								disabled={saving}
							>
								Anuluj
							</button>
							<button
								type="submit"
								className={styles.modalButton}
								disabled={saving}
							>
								{saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
							</button>
						</div>
					</form>
				</Modal>
			) : null}

			{isCreditsModalOpen && user && canSetCredits && credits !== null ? (
				<Modal
					title="Edytuj kredyty"
					subtitle={user.name || user.email || 'Użytkownik'}
					onClose={closeCreditsModal}
				>
					<form className={styles.modalForm} onSubmit={handleCreditsSubmit}>
						<label className={styles.modalLabel}>
							Kredyty
							<input
								type="number"
								className={styles.modalInput}
								value={editCredits}
								onChange={(event) => setEditCredits(Number(event.target.value))}
								min="0"
								step="1"
								required
							/>
						</label>

						{creditsSaveError ? <p className={styles.modalError}>{creditsSaveError}</p> : null}

						<div className={styles.modalActions}>
							<button
								type="button"
								className={styles.modalSecondaryButton}
								onClick={closeCreditsModal}
								disabled={savingCredits}
							>
								Anuluj
							</button>
							<button
								type="submit"
								className={styles.modalButton}
								disabled={savingCredits}
							>
								{savingCredits ? 'Zapisywanie...' : 'Zapisz zmiany'}
							</button>
						</div>
					</form>
				</Modal>
			) : null}
		</>
	)
}


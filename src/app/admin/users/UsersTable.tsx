"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { useUserCan } from '@raburski/next-auth-permissions/client'
import Modal from '@/app/components/Modal/Modal'
import { Permission } from '@/lib/permissions'
import { UserRole, UserStatus } from '@prisma/client'
import styles from './page.module.css'

type AdminUser = {
	id: string
	name: string | null
	email: string | null
	role: UserRole
	status: UserStatus
	createdAt: string
}

type UsersResponse = {
	users: AdminUser[]
}

const fetcher = async (url: string) => {
	const response = await fetch(url, { cache: 'no-store' })

	if (!response.ok) {
		throw new Error('Failed to fetch users')
	}

	return response.json()
}

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

const roleOptions: UserRole[] = ['USER', 'MODERATOR', 'ADMIN']
const statusOptions: UserStatus[] = ['ACTIVE', 'BANNED', 'DELETED']

export default function UsersTable() {
	const { data, error, isLoading, mutate } = useSWR<UsersResponse>('/api/admin/users', fetcher)
	const canEdit = useUserCan<Permission>(Permission.USERS_MANAGE)
	const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editRole, setEditRole] = useState<UserRole>('USER')
	const [editStatus, setEditStatus] = useState<UserStatus>('ACTIVE')
	const [saving, setSaving] = useState(false)
	const [saveError, setSaveError] = useState<string | null>(null)

	if (isLoading) {
		return <div className={styles.emptyState}>Ładowanie użytkowników...</div>
	}

	if (error) {
		return <div className={styles.emptyState}>Nie udało się pobrać listy użytkowników.</div>
	}

	const users = data?.users ?? []

	if (users.length === 0) {
		return <div className={styles.emptyState}>Brak użytkowników do wyświetlenia.</div>
	}

	const openModal = (user: AdminUser) => {
		if (!canEdit) {
			return
		}

		setSelectedUser(user)
		setEditRole(user.role)
		setEditStatus(user.status)
		setSaveError(null)
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
		setSelectedUser(null)
		setSaveError(null)
	}

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()

		if (!selectedUser) {
			return
		}

		try {
			setSaving(true)
			setSaveError(null)

			const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
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

			await mutate()
			closeModal()
		} catch (submitError) {
			setSaveError(submitError instanceof Error ? submitError.message : 'Wystąpił błąd podczas zapisu')
		} finally {
			setSaving(false)
		}
	}

	return (
		<>
			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>Użytkownik</th>
							<th>Email</th>
							<th>Rola</th>
							<th>Status</th>
							<th>Dołączył</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr
								key={user.id}
								className={canEdit ? styles.clickableRow : undefined}
								onClick={canEdit ? () => openModal(user) : undefined}
							>
								<td>{user.name || '—'}</td>
								<td>{user.email || '—'}</td>
								<td>{user.role}</td>
								<td>
									<span className={statusBadgeClass(user.status)}>
										{user.status}
									</span>
								</td>
								<td>{new Date(user.createdAt).toLocaleString('pl-PL')}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{isModalOpen && selectedUser ? (
				<Modal
					title="Edytuj użytkownika"
					subtitle={selectedUser.name || selectedUser.email || 'Użytkownik'}
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
		</>
	)
}

"use client"

import { useState, useEffect } from 'react'
import { useSWRPaginated } from '@raburski/next-pagination/client'
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


export default function UsersTable() {
	const limit = 20
	const {
		data: allUsers,
		error,
		isLoading,
		totalCount,
		page: hookPage,
		goToPage,
		resetPagination
	} = useSWRPaginated<AdminUser>('/api/admin/users', { limit })
	
	const [targetPage, setTargetPage] = useState<number | null>(null)
	
	const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 0
	
	// When targetPage changes, navigate to that page
	useEffect(() => {
		if (targetPage !== null) {
			if (targetPage === hookPage) {
				// Already on target page, clear target
				setTargetPage(null)
				return
			}
			
			if (targetPage === 1) {
				resetPagination()
				setTargetPage(null)
			} else {
				// Reset to clear accumulated data, then navigate to target page
				resetPagination()
				const timer = setTimeout(() => {
					goToPage(targetPage)
				}, 100)
				return () => clearTimeout(timer)
			}
		}
	}, [targetPage, hookPage, resetPagination, goToPage])
	
	// Clear targetPage when we reach it
	useEffect(() => {
		if (targetPage !== null && targetPage === hookPage) {
			setTargetPage(null)
		}
	}, [targetPage, hookPage])

	// For table view, show only current page's data
	// After reset + goToPage, allUsers should contain only that page's data
	const users = allUsers

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages && newPage !== hookPage) {
			setTargetPage(newPage)
		}
	}

	if (isLoading && users.length === 0) {
		return <div className={styles.emptyState}>Ładowanie użytkowników...</div>
	}

	if (error) {
		return <div className={styles.emptyState}>Nie udało się pobrać listy użytkowników.</div>
	}

	if (users.length === 0 && !isLoading) {
		return <div className={styles.emptyState}>Brak użytkowników do wyświetlenia.</div>
	}

	const openUserProfile = (user: AdminUser) => {
		window.open(`/profile/${user.id}`, '_blank')
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
								className={styles.clickableRow}
								onClick={() => openUserProfile(user)}
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

			{totalPages > 1 && (
				<div className={styles.pagination}>
					<button
						className={styles.paginationButton}
						onClick={() => handlePageChange(hookPage - 1)}
						disabled={hookPage === 1 || isLoading}
					>
						Poprzednia
					</button>
					<div className={styles.paginationInfo}>
						Strona {hookPage} z {totalPages} ({totalCount} użytkowników)
					</div>
					<button
						className={styles.paginationButton}
						onClick={() => handlePageChange(hookPage + 1)}
						disabled={hookPage >= totalPages || isLoading}
					>
						Następna
					</button>
				</div>
			)}

		</>
	)
}

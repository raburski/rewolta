 "use client"

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { useUserCan } from '@raburski/next-auth-permissions/client'
import Modal from '@/app/components/Modal/Modal'
import { Permission } from '@/lib/permissions'
import { resizeImage } from '@/lib/imageUtils'
import styles from './page.module.css'

interface BuildingProduct {
	id: string
	name: string
	imageUrl: string
	status: 'ACTIVE' | 'INACTIVE'
	createdAt: string
	updatedAt: string
}

interface BuildingsResponse {
	products: BuildingProduct[]
}

const fetcher = async (url: string) => {
	const response = await fetch(url, { cache: 'no-store' })

	if (!response.ok) {
		throw new Error('Failed to fetch building products')
	}

	return response.json()
}

function statusBadgeClass(status: BuildingProduct['status']) {
	switch (status) {
		case 'ACTIVE':
			return `${styles.badge} ${styles.badgeActive}`
		case 'INACTIVE':
		default:
			return `${styles.badge} ${styles.badgeInactive}`
	}
}

export default function BuildingsTable() {
	const { data, error, isLoading, mutate } = useSWR<BuildingsResponse>('/api/admin/buildings', fetcher)
	const canManage = useUserCan(Permission.BUILDING_PRODUCTS_MANAGE)
	const [selectedProduct, setSelectedProduct] = useState<BuildingProduct | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editName, setEditName] = useState('')
	const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE')
	const [saving, setSaving] = useState(false)
	const [saveError, setSaveError] = useState<string | null>(null)
	
	// Create modal state
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [createName, setCreateName] = useState('')
	const [createDescription, setCreateDescription] = useState('')
	const [createStatus, setCreateStatus] = useState<'ACTIVE' | 'INACTIVE'>('INACTIVE')
	const [createImage, setCreateImage] = useState<File | null>(null)
	const [createImagePreview, setCreateImagePreview] = useState<string | null>(null)
	const [creating, setCreating] = useState(false)
	const [createError, setCreateError] = useState<string | null>(null)

	if (isLoading) {
		return <div className={styles.emptyState}>Ładowanie generatorów...</div>
	}

	if (error) {
		return <div className={styles.emptyState}>Nie udało się pobrać listy generatorów.</div>
	}

	const products = data?.products ?? []

	if (products.length === 0) {
		return <div className={styles.emptyState}>Brak generatorów do wyświetlenia.</div>
	}

	const openModal = (product: BuildingProduct) => {
		if (!canManage) {
			return
		}

		setSelectedProduct(product)
		setEditName(product.name)
		setEditStatus(product.status)
		setSaveError(null)
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
		setSelectedProduct(null)
		setSaveError(null)
	}

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()

		if (!selectedProduct) {
			return
		}

		try {
			setSaving(true)
			setSaveError(null)

			const response = await fetch(`/api/admin/buildings/${selectedProduct.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: editName,
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

	const openCreateModal = () => {
		setIsCreateModalOpen(true)
		setCreateName('')
		setCreateDescription('')
		setCreateStatus('INACTIVE')
		setCreateImage(null)
		setCreateImagePreview(null)
		setCreateError(null)
	}

	const closeCreateModal = () => {
		setIsCreateModalOpen(false)
		setCreateName('')
		setCreateDescription('')
		setCreateStatus('INACTIVE')
		setCreateImage(null)
		setCreateImagePreview(null)
		setCreateError(null)
	}

	const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			try {
				// Resize image to reasonable size before upload (max 1920x1920)
				const resizedBlob = await resizeImage(file, 1920, 1920, 0.9)
				
				// Convert blob to File for FormData
				const resizedFile = new File([resizedBlob], file.name, {
					type: 'image/jpeg',
					lastModified: Date.now()
				})
				
				setCreateImage(resizedFile)
				
				// Update preview with resized image
				const reader = new FileReader()
				reader.onloadend = () => {
					setCreateImagePreview(reader.result as string)
				}
				reader.readAsDataURL(resizedBlob)
			} catch (error) {
				console.error('Error resizing image:', error)
				setCreateError('Nie udało się przetworzyć obrazu')
			}
		}
	}

	const handleCreateSubmit = async (event: React.FormEvent) => {
		event.preventDefault()

		if (!createName || !createDescription || !createImage) {
			setCreateError('Wszystkie pola są wymagane')
			return
		}

		try {
			setCreating(true)
			setCreateError(null)

			const formData = new FormData()
			formData.append('name', createName)
			formData.append('description', createDescription)
			formData.append('status', createStatus)
			formData.append('image', createImage)

			const response = await fetch('/api/admin/buildings', {
				method: 'POST',
				body: formData
			})

			if (!response.ok) {
				const body = await response.json().catch(() => null)
				throw new Error(body?.error || 'Nie udało się utworzyć generatora')
			}

			await mutate()
			closeCreateModal()
		} catch (submitError) {
			setCreateError(submitError instanceof Error ? submitError.message : 'Wystąpił błąd podczas tworzenia')
		} finally {
			setCreating(false)
		}
	}

	return (
		<>
			{canManage && (
				<div className={styles.addButtonContainer}>
					<button
						type="button"
						className={styles.addButton}
						onClick={openCreateModal}
					>
						Dodaj
					</button>
				</div>
			)}
			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th></th>
							<th>Nazwa</th>
							<th>Status</th>
							<th>Akcje</th>
						</tr>
					</thead>
					<tbody>
						{products.map((product) => (
							<tr
								key={product.id}
								className={canManage ? styles.clickableRow : undefined}
								onClick={canManage ? () => openModal(product) : undefined}
							>
								<td>
									<img
										src={product.imageUrl}
										alt={product.name}
										className={styles.productImage}
									/>
								</td>
								<td>{product.name}</td>
								<td>
									<span className={statusBadgeClass(product.status)}>
										{product.status === 'ACTIVE' ? 'Aktywny' : 'Nieaktywny'}
									</span>
								</td>
								<td>
									<Link
										href={`/ai/${product.id}`}
										className={styles.viewButton}
										onClick={(e) => e.stopPropagation()}
									>
										Otwórz
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{isModalOpen && selectedProduct ? (
				<Modal
					title="Edytuj generator"
					subtitle={selectedProduct.name}
					onClose={closeModal}
				>
					<form className={styles.modalForm} onSubmit={handleSubmit}>
						<label className={styles.modalLabel}>
							Nazwa
							<input
								className={styles.modalInput}
								value={editName}
								onChange={(event) => setEditName(event.target.value)}
								required
							/>
						</label>

						<label className={styles.modalLabel}>
							Status
							<select
								className={styles.modalSelect}
								value={editStatus}
								onChange={(event) => setEditStatus(event.target.value as 'ACTIVE' | 'INACTIVE')}
							>
								<option value="ACTIVE">Aktywny</option>
								<option value="INACTIVE">Nieaktywny</option>
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

			{isCreateModalOpen ? (
				<Modal
					title="Dodaj nowy generator"
					onClose={closeCreateModal}
				>
					<form className={styles.modalForm} onSubmit={handleCreateSubmit}>
						<label className={styles.modalLabel}>
							Nazwa
							<input
								className={styles.modalInput}
								value={createName}
								onChange={(event) => setCreateName(event.target.value)}
								required
							/>
						</label>

						<label className={styles.modalLabel}>
							Opis
							<textarea
								className={styles.modalTextarea}
								value={createDescription}
								onChange={(event) => setCreateDescription(event.target.value)}
								required
								rows={3}
							/>
						</label>

						<label className={styles.modalLabel}>
							Status
							<select
								className={styles.modalSelect}
								value={createStatus}
								onChange={(event) => setCreateStatus(event.target.value as 'ACTIVE' | 'INACTIVE')}
							>
								<option value="INACTIVE">Nieaktywny</option>
								<option value="ACTIVE">Aktywny</option>
							</select>
						</label>

						<label className={styles.modalLabel}>
							Obraz
							<input
								type="file"
								accept="image/*"
								onChange={handleImageChange}
								required
								className={styles.modalFileInput}
							/>
							{createImagePreview && (
								<img
									src={createImagePreview}
									alt="Podgląd"
									className={styles.modalImagePreview}
								/>
							)}
						</label>

						{createError ? <p className={styles.modalError}>{createError}</p> : null}

						<div className={styles.modalActions}>
							<button
								type="button"
								className={styles.modalSecondaryButton}
								onClick={closeCreateModal}
								disabled={creating}
							>
								Anuluj
							</button>
							<button
								type="submit"
								className={styles.modalButton}
								disabled={creating}
							>
								{creating ? 'Tworzenie...' : 'Utwórz'}
							</button>
						</div>
					</form>
				</Modal>
			) : null}
		</>
	)
}

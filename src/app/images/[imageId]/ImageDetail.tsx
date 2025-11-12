'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { FaFacebook, FaArrowLeft, FaDownload } from 'react-icons/fa6'
import { useRouter } from 'next/navigation'
import { downloadImage } from '@/lib/download'
import { useImageDetail } from '@/lib/hooks/useImageDetail'
import { useBuildingProduct } from '@/lib/hooks/useBuildingProduct'
import { useSubmitBuilding } from '@/lib/hooks/useSubmitBuilding'
import { CUSTOM_PRODUCT_ID } from '@/lib/constants'
import styles from './ImageDetail.module.css'

interface ImageDetailProps {
	imageId: string
}

export default function ImageDetail({ imageId }: ImageDetailProps) {
	const { data: session } = useSession()
	const router = useRouter()
	
	// Use SWR for data fetching
	const { imageData, isLoading, hasError, error, mutate } = useImageDetail(imageId)
	
	// Use SWR for product data
	const { product } = useBuildingProduct(imageData?.productId || null)
	
	// Submit building for rating
	const { submitBuilding, isSubmitting, error: submitError } = useSubmitBuilding()
	
	const submission = imageData?.submission
	const isSubmitted = !!submission

	const handleShare = () => {
		if (!imageData) return

		const shareText = 'Sprawdź mój wygenerowany budynek! 🏛️✨'
		const shareUrl = `${window.location.origin}/images/${imageId}`
		const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
		window.open(facebookUrl, '_blank', 'width=600,height=400')
	}

	const handleDownload = async () => {
		if (!imageData?.imageUrl) return

		await downloadImage(imageData.imageUrl, `generated-image-${imageId}.png`)
	}

	const handleBack = () => {
		router.back()
	}

	const handleOriginalImageClick = () => {
		if (imageData?.productId) {
			router.push(`/ai/${imageData.productId}`)
		}
	}

	const handleSubmitForRating = async () => {
		if (!imageData?.productId || imageData.productId === CUSTOM_PRODUCT_ID) return

		const result = await submitBuilding({
			imageId: imageData.id,
			productId: imageData.productId
		})

		if (result) {
			// Refresh image data to get updated submission status
			mutate()
		}
	}

	if (isLoading) {
		return (
			<div className={styles.skeletonContainer}>
				<div className={styles.skeletonImageContainer}></div>
				
				<div className={styles.skeletonSidebar}>
					<div className={styles.skeletonInfoContainer}>
						<div className={styles.skeletonOriginalBuildingSection}>
							<div className={styles.skeletonOriginalBuildingLabel}></div>
							<div className={styles.skeletonOriginalImageContainer}></div>
						</div>
						
						<div className={styles.skeletonInfoItem}>
							<div className={styles.skeletonInfoLabel}></div>
							<div className={styles.skeletonInfoValue}></div>
						</div>
					</div>

					<div className={styles.skeletonActionsContainer}>
						<div className={styles.skeletonActionButton}></div>
						<div className={styles.skeletonActionButton}></div>
					</div>
				</div>
			</div>
		)
	}

	if (hasError) {
		return (
			<div className={styles.errorContainer}>
				<p className={styles.errorText}>{error}</p>
				<button onClick={handleBack} className={styles.backButton}>
					<FaArrowLeft className={styles.backIcon} />
					Powrót
				</button>
			</div>
		)
	}

	if (!imageData) {
		return (
			<div className={styles.errorContainer}>
				<p className={styles.errorText}>Nie znaleziono obrazu</p>
				<button onClick={handleBack} className={styles.backButton}>
					<FaArrowLeft className={styles.backIcon} />
					Powrót
				</button>
			</div>
		)
	}

	return (
		<div className={styles.container}>
			<div className={styles.imageContainer}>
				<img 
					src={imageData.imageUrl} 
					alt="Generated image" 
					className={styles.image}
				/>
			</div>

			<div className={styles.sidebar}>
				<div className={styles.infoContainer}>
					{/* Only show "Modyfikowany budynek" section if not using custom product */}
					{imageData.productId !== CUSTOM_PRODUCT_ID && (
						<div className={styles.originalBuildingSection}>
							<strong>Modyfikowany budynek:</strong>
							<div className={styles.originalImageContainer}>
								<img 
									src={product?.imageUrl || '/assets/museum-small.png'} 
									alt={`${product?.name || 'Original'} building`} 
									className={styles.originalImage}
									onClick={handleOriginalImageClick}
									title="Kliknij aby przejść do generatora"
								/>
							</div>
						</div>
					)}
					<div className={styles.infoItem}>
						<strong>Utworzono:</strong>
						<span>{new Date(imageData.createdAt).toLocaleString('pl-PL')}</span>
					</div>
				</div>

				<div className={styles.actionsContainer}>
					{/* Only show submit button if not using custom product */}
					{session && !isSubmitted && imageData.productId !== CUSTOM_PRODUCT_ID && (
						<button
							onClick={handleSubmitForRating}
							className={styles.submitButton}
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Wysyłanie...' : 'Zgłoś do oceny'}
						</button>
					)}
					{isSubmitted && submission && (
						<div className={styles.submittedMessage}>
							{submission.status === 'PUBLISHED' && (
								<>✓ Zgłoszono do oceny (ELO: {submission.eloRating})</>
							)}
							{submission.status === 'PENDING' && (
								<>⏳ Oczekuje na moderację</>
							)}
							{submission.status === 'WITHDRAWN' && (
								<>↩️ Wycofano z oceny</>
							)}
							{submission.status === 'FLAGGED' && (
								<>⚠️ Zgłoszono do sprawdzenia</>
							)}
						</div>
					)}
					{submitError && (
						<div className={styles.errorMessage}>
							Błąd: {submitError}
						</div>
					)}
					<button onClick={handleShare} className={styles.shareButton}>
						<FaFacebook className={styles.shareIcon} />
						Udostępnij
					</button>
					<button onClick={handleDownload} className={styles.downloadButton}>
						<FaDownload className={styles.downloadIcon} />
						Pobierz
					</button>
				</div>
			</div>
		</div>
	)
} 
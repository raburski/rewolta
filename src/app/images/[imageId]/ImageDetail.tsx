'use client'

import { useSession } from 'next-auth/react'
import { FaFacebook, FaArrowLeft, FaDownload } from 'react-icons/fa6'
import { useRouter } from 'next/navigation'
import { downloadImage } from '@/lib/download'
import { useImageDetail } from '@/lib/hooks/useImageDetail'
import styles from './ImageDetail.module.css'

// Product to original image mapping
const PRODUCT_ORIGINAL_IMAGES = {
	museum: '/assets/museum-small.png'
} as const

interface ImageDetailProps {
	imageId: string
}

export default function ImageDetail({ imageId }: ImageDetailProps) {
	const { data: session } = useSession()
	const router = useRouter()
	
	// Use SWR for data fetching
	const { imageData, isLoading, hasError, error, mutate } = useImageDetail(imageId)

	const handleShare = () => {
		if (!imageData?.imageUrl) return

		const shareText = 'Sprawdź mój wygenerowany budynek! 🏛️✨'
		const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageData.imageUrl)}&quote=${encodeURIComponent(shareText)}`
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
			router.push(`/${imageData.productId}`)
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
					<div className={styles.originalBuildingSection}>
						<strong>Modyfikowany budynek:</strong>
						<div className={styles.originalImageContainer}>
							<img 
								src={PRODUCT_ORIGINAL_IMAGES[imageData.productId as keyof typeof PRODUCT_ORIGINAL_IMAGES] || '/assets/museum-small.png'} 
								alt="Original building" 
								className={styles.originalImage}
								onClick={handleOriginalImageClick}
								title="Kliknij aby przejść do generatora"
							/>
						</div>
					</div>
					<div className={styles.infoItem}>
						<strong>Utworzono:</strong>
						<span>{new Date(imageData.createdAt).toLocaleString('pl-PL')}</span>
					</div>
				</div>

				<div className={styles.actionsContainer}>
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
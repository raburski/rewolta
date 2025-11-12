'use client'

import { useSession } from 'next-auth/react'
import { FaFacebook, FaWandMagicSparkles } from 'react-icons/fa6'
import { useRouter } from 'next/navigation'
import { useAllUserImages } from '@/lib/hooks/useAllUserImages'
import styles from './AllImagesHistory.module.css'

export default function AllImagesHistory() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const isAuthenticated = !!session?.user?.name
	const isSessionLoading = status === 'loading'
	
	// Use SWR for data fetching
	const { images, isLoading, hasError, error, mutate } = useAllUserImages(isAuthenticated)

	const handleShare = (imageId: string) => {
		const shareUrl = `${window.location.origin}/images/${imageId}`
		const shareText = 'Sprawdź mój wygenerowany budynek! 🏛️✨'
		const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
		window.open(facebookUrl, '_blank', 'width=600,height=400')
	}

	const handleImageClick = (imageId: string) => {
		router.push(`/images/${imageId}`)
	}

	if (isSessionLoading || isLoading) {
		return (
			<div className={styles.container}>
				<div className={styles.imageGrid}>
					{Array.from({ length: 8 }).map((_, index) => (
						<div key={index} className={styles.skeletonCard}>
							<div className={styles.skeletonImage}></div>
							<div className={styles.skeletonInfo}>
								<div className={styles.skeletonDate}></div>
								<div className={styles.skeletonButton}></div>
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	if (hasError) {
		return (
			<div className={styles.errorContainer}>
				<p className={styles.errorText}>{error}</p>
			</div>
		)
	}

	// Show authentication required message if not authenticated and session is loaded
	if (!isSessionLoading && !isAuthenticated) {
		return (
			<div className={styles.emptyContainer}>
				<FaWandMagicSparkles className={styles.emptyIcon} />
				<h3>Wymagane logowanie</h3>
				<p>Zaloguj się, aby zobaczyć historię generowań.</p>
				<a href="/api/auth/signin" className={styles.generateButton}>
					Zaloguj się
				</a>
			</div>
		)
	}

	if (!isSessionLoading && !isLoading && isAuthenticated && images.length === 0) {
		return (
			<div className={styles.emptyContainer}>
				<FaWandMagicSparkles className={styles.emptyIcon} />
				<h3>Brak wygenerowanych obrazów</h3>
				<p>Nie masz jeszcze żadnych wygenerowanych obrazów.</p>
				<a href="/ai" className={styles.generateButton}>
					Generuj pierwszy obraz
				</a>
			</div>
		)
	}

	return (
		<div className={styles.container}>
			<div className={styles.imageGrid}>
				{images.map((image) => (
					<div key={image.id} className={styles.imageCard}>
						<div 
							className={styles.imageContainer}
							onClick={() => handleImageClick(image.id)}
							style={{ cursor: 'pointer' }}
						>
							<img 
								src={image.imageUrl} 
								alt="Generated image" 
								className={styles.image}
							/>
						</div>
						<div className={styles.imageInfo}>
							<div className={styles.imageMeta}>
								{image.productName && (
									<p className={styles.productName}>{image.productName}</p>
								)}
								<p className={styles.imageDate}>
									{new Date(image.createdAt).toLocaleDateString('pl-PL')}
								</p>
							</div>
							<button 
								className={styles.shareButton}
								onClick={(e) => {
									e.stopPropagation()
									handleShare(image.id)
								}}
							>
								<FaFacebook className={styles.shareIcon} />
								Udostępnij
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}



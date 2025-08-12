'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaFacebook, FaWandMagicSparkles } from 'react-icons/fa6'
import { useRouter } from 'next/navigation'
import styles from './ImageHistory.module.css'

interface ImageHistoryProps {
	productId: string
}

interface GeneratedImage {
	id: string
	imageUrl: string
	createdAt: string
	status: string
	productId: string
}

export default function ImageHistory({ productId }: ImageHistoryProps) {
	const { data: session } = useSession()
	const router = useRouter()
	const [images, setImages] = useState<GeneratedImage[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchImages = async () => {
			try {
				setLoading(true)
				const response = await fetch(`/api/profile/images/${productId}`)
				
				if (!response.ok) {
					if (response.status === 401) {
						setError('Authentication required')
					} else {
						setError('Failed to load images')
					}
					return
				}
				
				const data = await response.json()
				setImages(data.images || [])
			} catch (err) {
				setError('Failed to load images')
				console.error('Error fetching images:', err)
			} finally {
				setLoading(false)
			}
		}

		if (session?.user?.name) {
			fetchImages()
		}
	}, [session?.user?.name, productId])

	const handleShare = (imageId: string) => {
		const shareUrl = `${window.location.origin}/images/${imageId}`
		const shareText = 'Sprawdź mój wygenerowany budynek! 🏛️✨'
		const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
		window.open(facebookUrl, '_blank', 'width=600,height=400')
	}

	const handleImageClick = (imageId: string) => {
		router.push(`/images/${imageId}`)
	}

	if (loading) {
		return (
			<div className={styles.container}>
				<div className={styles.imageGrid}>
					{Array.from({ length: 4 }).map((_, index) => (
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

	if (error) {
		return (
			<div className={styles.errorContainer}>
				<p className={styles.errorText}>{error}</p>
			</div>
		)
	}

	if (images.length === 0) {
		return (
			<div className={styles.emptyContainer}>
				<FaWandMagicSparkles className={styles.emptyIcon} />
				<h3>Brak wygenerowanych obrazów</h3>
				<p>Nie masz jeszcze żadnych wygenerowanych obrazów dla tego produktu.</p>
				<a href="/museum" className={styles.generateButton}>
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
							<p className={styles.imageDate}>
								{new Date(image.createdAt).toLocaleDateString('pl-PL')}
							</p>
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
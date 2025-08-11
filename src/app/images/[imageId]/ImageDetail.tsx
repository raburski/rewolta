'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaFacebook, FaArrowLeft, FaDownload } from 'react-icons/fa6'
import { useRouter } from 'next/navigation'
import { downloadImage } from '@/lib/download'
import styles from './ImageDetail.module.css'

// Product to original image mapping
const PRODUCT_ORIGINAL_IMAGES = {
	museum: '/assets/museum-small.png'
} as const

interface ImageDetailProps {
	imageId: string
}

interface ImageData {
	id: string
	productId: string
	ownerId: string
	imageUrl: string
	imageId: string
	createdAt: string
	updatedAt: string
}

export default function ImageDetail({ imageId }: ImageDetailProps) {
	const { data: session } = useSession()
	const router = useRouter()
	const [imageData, setImageData] = useState<ImageData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchImage = async () => {
			try {
				setLoading(true)
				const response = await fetch(`/api/images/${imageId}`)
				
				if (!response.ok) {
					if (response.status === 404) {
						setError('Obraz nie został znaleziony')
					} else {
						setError('Nie udało się załadować obrazu')
					}
					return
				}
				
				const data = await response.json()
				setImageData(data)
			} catch (err) {
				setError('Nie udało się załadować obrazu')
				console.error('Error fetching image:', err)
			} finally {
				setLoading(false)
			}
		}

		fetchImage()
	}, [imageId])

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

	if (loading) {
		return (
			<div className={styles.loadingContainer}>
				<div className={styles.loadingSpinner}></div>
				<p>Ładowanie obrazu...</p>
			</div>
		)
	}

	if (error) {
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
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaFacebook, FaArrowLeft, FaDownload } from 'react-icons/fa6'
import { useRouter } from 'next/navigation'
import styles from './ImageDetail.module.css'

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

	const handleDownload = () => {
		if (!imageData?.imageUrl) return

		const link = document.createElement('a')
		link.href = imageData.imageUrl
		link.download = `generated-image-${imageId}.png`
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
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
					<div className={styles.infoItem}>
						<strong>ID obrazu:</strong>
						<span>{imageData.imageId}</span>
					</div>
					<div className={styles.infoItem}>
						<strong>Produkt:</strong>
						<span>{imageData.productId}</span>
					</div>
					<div className={styles.infoItem}>
						<strong>Utworzono:</strong>
						<span>{new Date(imageData.createdAt).toLocaleString('pl-PL')}</span>
					</div>
					<div className={styles.infoItem}>
						<strong>Zaktualizowano:</strong>
						<span>{new Date(imageData.updatedAt).toLocaleString('pl-PL')}</span>
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
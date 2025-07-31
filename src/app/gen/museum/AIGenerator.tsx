'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { FaFacebook, FaWandMagicSparkles } from 'react-icons/fa6'
import { IoAdd } from 'react-icons/io5'
import styles from './AIGenerator.module.css'
import LoadingAnimation from './LoadingAnimation'
import SignInModal from './SignInModal'

const FACEBOOK_SHARE_TEXT = 'Sprawdź mój wygenerowany budynek! 🏛️✨'

export default function AIGenerator() {
	const { data: session, status } = useSession()
	const [selectedImage, setSelectedImage] = useState<string>('')
	const [isGenerating, setIsGenerating] = useState(false)
	const [generatedImage, setGeneratedImage] = useState<string>('')
	const [showLoginModal, setShowLoginModal] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const onCloseLoginModal = () => setShowLoginModal(false)
	const onOpenLoginModal = () => setShowLoginModal(true)

	const handleShare = (platform: 'facebook') => {
		if (!generatedImage) return

		const shareUrl = window.location.href
		const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(FACEBOOK_SHARE_TEXT)}`
		window.open(facebookUrl, '_blank', 'width=600,height=400')
	}

	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			if (status !== 'authenticated') {
				onOpenLoginModal()
				return
			}
			const imageUrl = URL.createObjectURL(file)
			setSelectedImage(imageUrl)
			// Clear previously generated image when new image is selected
			setGeneratedImage('')
		}
	}

	const handleImageClick = () => {
		if (status !== 'authenticated') {
			onOpenLoginModal()
			return
		}
		fileInputRef.current?.click()
	}

	const handleGenerate = async () => {
		if (!selectedImage) return
		
		setIsGenerating(true)
		
		try {
			// Convert selected image to base64
			const response = await fetch(selectedImage)
			const blob = await response.blob()
			const base64 = await new Promise<string>((resolve) => {
				const reader = new FileReader()
				reader.onloadend = () => {
					const result = reader.result as string
					// Remove the data:image/jpeg;base64, prefix
					const base64Data = result.split(',')[1]
					resolve(base64Data)
				}
				reader.readAsDataURL(blob)
			})

			// Make API call
			const apiResponse = await fetch('/api/generate-building', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					inputBase64Image: base64
				})
			})

			if (!apiResponse.ok) {
				throw new Error('Failed to generate building')
			}

			const data = await apiResponse.json()
			console.log('Generated result:', data)
			
			// Handle the generated image result
			if (data.result) {
				setGeneratedImage(data.result)
			}
			
		} catch (error) {
			console.error('Error generating building:', error)
			// TODO: Show error message to user
		} finally {
			setIsGenerating(false)
		}
	}

	return (
		<div className={styles.container}>
			<div className={styles.mainContent}>
				<div className={styles.inputSection}>
					{/* First input box with museum image */}
					<div className={styles.inputBox}>
						<div className={styles.imageContainer}>
							<img 
								src="/assets/museum-small.jpg" 
								alt="Museum reference" 
								className={styles.referenceImage}
							/>
						</div>
						<p className={styles.imageLabel}>Oryginalny budynek</p>
					</div>

					{/* Plus symbol */}
					<div className={styles.plusContainer}>
						<div className={styles.plusSymbol}>
							<IoAdd className={styles.plusIcon} />
						</div>
					</div>

					{/* Second input box with image selector */}
					<div className={styles.inputBox}>
						<div className={styles.imageContainer}>
							{selectedImage ? (
								<img 
									src={selectedImage} 
									alt="Selected image" 
									className={styles.selectedImage}
									onClick={handleImageClick}
									title="Kliknij aby zmienić obraz"
								/>
							) : (
								<button 
									className={styles.addButton}
									onClick={handleImageClick}
									disabled={isGenerating}
								>
									<IoAdd className={styles.plusIcon} />
									Dodaj obraz
								</button>
							)}
						</div>
						<p className={styles.imageLabel}>Twój budynek-inspiracja</p>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className={styles.fileInput}
							onChange={handleImageSelect}
						/>
					</div>
				</div>

				{/* Result box with generate button inside */}
				<div className={styles.resultSection}>
					<div className={styles.resultBox}>
						<div className={styles.generateContainer}>
							<LoadingAnimation isLoading={isGenerating} size="medium" />
							{!isGenerating && !generatedImage && status === 'authenticated' && (
								<button
									className={`${styles.generateButton} ${isGenerating ? styles.generating : ''}`}
									onClick={handleGenerate}
									disabled={isGenerating || !selectedImage}
								>
									<FaWandMagicSparkles className={styles.magicWandIcon} />
									{selectedImage ? 'Generuj' : 'Dodaj obraz aby generować'}
								</button>
							)}
							{!isGenerating && !generatedImage && status === 'unauthenticated' && (
								<button
									className={`${styles.generateButton} ${isGenerating ? styles.generating : ''}`}
									onClick={onOpenLoginModal}
									disabled={isGenerating}
								>
									<FaFacebook className={styles.facebookIcon} />
									Zaloguj z FB
								</button>
							)}
							{!isGenerating && generatedImage && (
								<img 
									src={generatedImage} 
									alt="Generated building" 
									className={styles.generatedImage}
								/>
							)}
						</div>
					</div>
					<p className={styles.resultLabel}>Wygenerowany obraz</p>
					<p className={styles.resultSubtitle}>Może zająć 1-5min</p>
				</div>
			</div>

			{/* User info sidebar */}
			<div className={styles.userSidebar}>
				<div className={styles.userCard}>
					<div className={styles.userHeader}>
						<div className={styles.userAvatar} onClick={() => window.location.href = '/profile'}>
							{session?.user?.image ? (
								<img 
									src={session.user.image} 
									alt="User avatar" 
									className={styles.avatarImage}
								/>
							) : (
								<div className={styles.avatarPlaceholder}>
									<FaFacebook className={styles.avatarIcon} />
								</div>
							)}
						</div>
						<div className={styles.userInfo}>
							<h3 className={styles.userName}>
								{session?.user?.name || 'Użytkownik'}
							</h3>
							<p className={styles.userEmail}>
								{session?.user?.email || 'user@example.com'}
							</p>
						</div>
					</div>
					<div className={styles.infoItem}>
						<strong>Zostało generowań</strong>
						<span>4</span>
					</div>
				</div>

				{/* Social sharing card - only show when image is generated */}
				{generatedImage && (
					<div className={styles.shareCard}>
						<h3 className={styles.shareTitle}>Udostępnij swój obraz</h3>
						<p className={styles.shareDescription}>
							Pokaż światu swój wygenerowany budynek!
						</p>
						<div className={styles.shareButtons}>
							<button className={styles.shareButton} onClick={() => handleShare('facebook')}>
								<FaFacebook className={styles.shareIcon} />
								Facebook
							</button>
						</div>
					</div>
				)}
			</div>

			<SignInModal isOpen={showLoginModal} onClose={onCloseLoginModal} />
		</div>
	)
} 
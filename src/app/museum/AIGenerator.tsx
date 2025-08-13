'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaFacebook, FaWandMagicSparkles } from 'react-icons/fa6'
import { IoAdd } from 'react-icons/io5'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { processImageFile } from '@/lib/imageUtils'
import { useUserCredits } from '@/lib/hooks/useUserCredits'
import styles from './AIGenerator.module.css'
import LoadingAnimation from './LoadingAnimation'
import SignInModal from './SignInModal'

const FACEBOOK_SHARE_TEXT = 'Sprawdź mój wygenerowany budynek! 🏛️✨'

export default function AIGenerator() {
	const { data: session, status } = useSession()
	const [selectedImage, setSelectedImage] = useState<string>('')
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [isGenerating, setIsGenerating] = useState(false)
	const [generatedImageData, setGeneratedImageData] = useState<{ imageUrl: string; id: string } | null>(null)
	const [showLoginModal, setShowLoginModal] = useState(false)
	const [jobId, setJobId] = useState<string>('')
	const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
	const [imageProcessing, setImageProcessing] = useState(false)
	const [wasResized, setWasResized] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Use SWR for credits management
	const { credits: userCredits, isLoading: creditsLoading, mutate: refreshCredits } = useUserCredits(status === 'authenticated')

	const onCloseLoginModal = () => {
		setShowLoginModal(false)
		// Refresh credits when modal is closed in case user just logged in
		setTimeout(() => {
			if (status === 'authenticated') {
				refreshCredits()
			}
		}, 1000) // Small delay to ensure session is updated
	}
	const onOpenLoginModal = () => setShowLoginModal(true)

	// Cleanup polling interval on unmount
	useEffect(() => {
		return () => {
			if (pollingInterval) {
				clearInterval(pollingInterval)
			}
		}
	}, [pollingInterval])

	const startPolling = (jobId: string) => {
		let pollCount = 0
		const maxPolls = 40 // 10 minutes maximum (40 * 15 seconds)
		
		const interval = setInterval(async () => {
			pollCount++
			
			// Stop polling if we've exceeded the maximum number of polls
			if (pollCount > maxPolls) {
				console.error('Polling timeout reached')
				setIsGenerating(false)
				setGeneratedImageData(null)
				setJobId('')
				clearInterval(interval)
				setPollingInterval(null)
				// TODO: Show timeout error message to user
				return
			}
			try {
				const response = await fetch(`/api/generate-building/status/${jobId}`)
				if (!response.ok) {
					throw new Error('Failed to check job status')
				}

				const data = await response.json()
				console.log('Polling result:', data)

				if (data.status === 'completed' && data.imageUrl) {
					setGeneratedImageData({ imageUrl: data.imageUrl, id: data.id })
					// Subtract 1 credit when image is successfully generated
					refreshCredits((currentData) => {
						if (currentData) {
							return {
								...currentData,
								credits: Math.max(0, currentData.credits - 1)
							}
						}
						return currentData
					}, false) // Don't revalidate, just update locally
					setIsGenerating(false)
					setJobId('')
					clearInterval(interval)
					setPollingInterval(null)
				} else if (data.status === 'failed') {
					console.error('Job failed:', data)
					setIsGenerating(false)
					setGeneratedImageData(null)
					setJobId('')
					clearInterval(interval)
					setPollingInterval(null)
					// TODO: Show error message to user
				} else if (data.status === 'pending' || data.status === 'processing') {
					// Continue polling
					console.log(`Job still in progress: ${data.status}`)
				} else {
					console.warn('Unknown job status:', data.status)
				}
			} catch (error) {
				console.error('Error polling job status:', error)
				setIsGenerating(false)
				setGeneratedImageData(null)
				setJobId('')
				clearInterval(interval)
				setPollingInterval(null)
				// TODO: Show error message to user
			}
		}, 15000) // Poll every 15 seconds

		setPollingInterval(interval)
	}

	const handleShare = (platform: 'facebook') => {
		if (!generatedImageData) return

		const shareUrl = `${window.location.origin}/images/${generatedImageData.id}`
		const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(FACEBOOK_SHARE_TEXT)}`
		window.open(facebookUrl, '_blank', 'width=600,height=400')
	}

	const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			if (status !== 'authenticated') {
				onOpenLoginModal()
				return
			}
			
			// Stop any existing polling
			if (pollingInterval) {
				clearInterval(pollingInterval)
				setPollingInterval(null)
			}
			
			setImageProcessing(true)
			
			try {
				// Process the image (resize if needed)
				const { blob, wasResized: resized } = await processImageFile(file)
				
				// Create a new file object from the processed blob
				const processedFile = new File([blob], file.name, {
					type: 'image/jpeg',
					lastModified: Date.now()
				})
				
				setSelectedFile(processedFile)
				setWasResized(resized)
				
				// Create object URL for display
				const imageUrl = URL.createObjectURL(blob)
				setSelectedImage(imageUrl)
				
				// Clear previously generated image and job when new image is selected
				setGeneratedImageData(null)
				setJobId('')
				setIsGenerating(false)
				
				if (resized) {
					console.log('Image was automatically resized to reduce file size')
				}
			} catch (error) {
				console.error('Error processing image:', error)
			} finally {
				setImageProcessing(false)
			}
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
		if (!selectedImage || !selectedFile) return
		
		// Check if user has credits
		if (userCredits === 0) {
			console.log('No credits available for generation')
			return
		}
		
		// Stop any existing polling
		if (pollingInterval) {
			clearInterval(pollingInterval)
			setPollingInterval(null)
		}
		
		setIsGenerating(true)
		
		try {
			// Convert selected image to base64
			const base64 = await new Promise<string>((resolve) => {
				const reader = new FileReader()
				reader.onloadend = () => {
					const result = reader.result as string
					// Remove the data:image/jpeg;base64, prefix
					const base64Data = result.split(',')[1]
					resolve(base64Data)
				}
				reader.readAsDataURL(selectedFile)
			})

			// Start image generation job
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
				throw new Error('Failed to start image generation')
			}

			const data = await apiResponse.json()
			console.log('Job started:', data)
			
			if (data.jobId) {
				setJobId(data.jobId)
				console.log('Started job with ID:', data.jobId)
				// Start polling for job completion
				startPolling(data.jobId)
			} else {
				throw new Error('No job ID received')
			}
			
		} catch (error) {
			console.error('Error starting image generation:', error)
			setIsGenerating(false)
			setGeneratedImageData(null)
			// TODO: Show error message to user
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
									disabled={isGenerating || imageProcessing}
								>
									{imageProcessing ? (
										<LoadingAnimation isLoading={true} size="small" />
									) : (
										<IoAdd className={styles.plusIcon} />
									)}
									{imageProcessing ? 'Przetwarzanie...' : 'Dodaj obraz'}
								</button>
							)}
						</div>
						<p className={styles.imageLabel}>Twój budynek-inspiracja</p>
						{selectedFile && (
							<p className={styles.fileInfo}>
								Rozmiar: {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
								{wasResized && (
									<span className={styles.resizeNote}> (zoptymalizowany)</span>
								)}
							</p>
						)}
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
							{!isGenerating && !generatedImageData && status === 'authenticated' && (
								<button
									className={`${styles.generateButton} ${isGenerating ? styles.generating : ''} ${userCredits === 0 ? styles.noCreditsButton : ''}`}
									onClick={handleGenerate}
									disabled={isGenerating || !selectedImage || userCredits === 0}
								>
									<FaWandMagicSparkles className={styles.magicWandIcon} />
									{userCredits === 0 ? 'Brak kredytów' : selectedImage ? 'Generuj' : 'Dodaj obraz aby generować'}
								</button>
							)}
							{!isGenerating && !generatedImageData && status === 'unauthenticated' && (
								<button
									className={`${styles.generateButton} ${isGenerating ? styles.generating : ''}`}
									onClick={onOpenLoginModal}
									disabled={isGenerating}
								>
									<FaFacebook className={styles.facebookIcon} />
									Zaloguj z FB
								</button>
							)}
							{!isGenerating && generatedImageData && (
								<img 
									src={generatedImageData.imageUrl} 
									alt="Generated building" 
									className={styles.generatedImage}
								/>
							)}
						</div>
					</div>
					<p className={styles.resultLabel}>Wygenerowany obraz</p>
					<p className={styles.resultSubtitle}>
						{isGenerating ? 'Generowanie w toku...' : 'Może zająć 1-5min'}
					</p>
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
						<span 
							className={`${userCredits === 0 ? styles.noCredits : ''} ${styles.creditsDisplay} ${creditsLoading ? styles.loading : ''}`}
							onClick={() => status === 'authenticated' && !creditsLoading && refreshCredits()}
							title={creditsLoading ? '' : 'Kliknij aby odświeżyć'}
						>
							{creditsLoading ? '...' : userCredits}
						</span>
					</div>
					<div className={styles.infoItem}>
						<a href="/profile/images/museum" className={styles.historyLink}>
							Historia generowań
						</a>
					</div>
				</div>

				{/* No credits card - only show when user has 0 credits */}
				{userCredits === 0 && status === 'authenticated' && (
					<div className={styles.noCreditsCard}>
						<h3 className={styles.noCreditsTitle}>Brak kredytów</h3>
						<p className={styles.noCreditsDescription}>
							Jeśli chcesz trochę więcej pogenerować, napisz do nas na{' '}
							<a 
								href="mailto:wroclaw@rewolta.org?subject=Museum%20Generator" 
								className={styles.noCreditsEmail}
							>
								wroclaw@rewolta.org
							</a>
						</p>
					</div>
				)}

				{/* Public page link card - only show when image is generated */}
				{generatedImageData && (
					<div className={styles.publicPageCard}>
						<h3 className={styles.publicPageTitle}>Publiczna strona</h3>
						<p className={styles.publicPageDescription}>
							Otwórz publiczną stronę z Twoim obrazem
						</p>
						<a 
							href={`/images/${generatedImageData.id}`}
							target="_blank"
							rel="noopener noreferrer"
							className={styles.publicPageLink}
						>
							<FaExternalLinkAlt className={styles.externalLinkIcon} />
							Otwórz publiczną stronę grafiki
						</a>
					</div>
				)}

				{/* Social sharing card - only show when image is generated */}
				{generatedImageData && (
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
'use client'

import { useState, useRef } from 'react'
import styles from './AIGenerator.module.css'
import LoadingAnimation from './LoadingAnimation'

export default function AIGenerator() {
	const [selectedImage, setSelectedImage] = useState<string>('')
	const [isGenerating, setIsGenerating] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			const imageUrl = URL.createObjectURL(file)
			setSelectedImage(imageUrl)
		}
	}

	const handleImageClick = () => {
		fileInputRef.current?.click()
	}

	const handleGenerate = async () => {
		if (!selectedImage || isGenerating) return
		
		setIsGenerating(true)
		
		// TODO: Implement AI generation logic
		console.log('Generate button clicked')
		
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 20000))
		
		setIsGenerating(false)
	}

	return (
		<div className={styles.container}>
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
					<p className={styles.imageLabel}>Obraz referencyjny</p>
				</div>

				{/* Plus symbol */}
				<div className={styles.plusContainer}>
					<div className={styles.plusSymbol}>
						<svg className={styles.plusIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
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
							>
								<svg className={styles.plusIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
								</svg>
								Dodaj obraz
							</button>
						)}
					</div>
					<p className={styles.imageLabel}>Twój obraz</p>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className={styles.fileInput}
						onChange={handleImageUpload}
					/>
				</div>
			</div>

			{/* Result box with generate button inside */}
			<div className={styles.resultSection}>
				<div className={styles.resultBox}>
					<div className={styles.generateContainer}>
						<LoadingAnimation isLoading={isGenerating} size="medium" />
						{!isGenerating && (
							<button
								className={`${styles.generateButton} ${isGenerating ? styles.generating : ''}`}
								onClick={handleGenerate}
								disabled={!selectedImage || isGenerating}
							>
								<svg className={styles.generateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
								{isGenerating ? 'Generowanie...' : (selectedImage ? 'Generuj' : 'Dodaj obraz aby generować')}
							</button>
						)}
					</div>
				</div>
				<p className={styles.resultLabel}>Wygenerowany obraz</p>
			</div>
		</div>
	)
} 
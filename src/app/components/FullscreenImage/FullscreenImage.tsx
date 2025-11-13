'use client'

import { useEffect, type MouseEvent } from 'react'
import styles from './FullscreenImage.module.css'

interface FullscreenImageProps {
	imageUrl: string
	alt?: string
	isOpen: boolean
	onClose: () => void
}

export default function FullscreenImage({ imageUrl, alt = 'Fullscreen image', isOpen, onClose }: FullscreenImageProps) {
	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (event: globalThis.KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		document.body.style.overflow = 'hidden'

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.body.style.overflow = ''
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) {
			onClose()
		}
	}

	return (
		<div className={styles.overlay} onClick={handleOverlayClick} role="presentation">
			<button
				type="button"
				className={styles.closeButton}
				onClick={onClose}
				aria-label="Zamknij"
			>
				×
			</button>
			<div className={styles.imageContainer}>
				<img 
					src={imageUrl} 
					alt={alt}
					className={styles.image}
				/>
			</div>
		</div>
	)
}


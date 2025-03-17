'use client'

import { FC, useRef, useState } from "react"
import styles from "./MemeGenerator.module.css"

type ImageSection = "top" | "bottom"

interface Margins {
	top: number
	bottom: number
	left: number
	right: number
}

interface MemeGeneratorProps {
	overlayImageUrl?: string
	topImageMargins?: Partial<Margins>
	bottomImageMargins?: Partial<Margins>
}

const defaultMargins: Margins = {
	top: 0,
	bottom: 0,
	left: 0,
	right: 0
}

const MemeGenerator: FC<MemeGeneratorProps> = ({ 
	overlayImageUrl,
	topImageMargins = defaultMargins,
	bottomImageMargins = defaultMargins
}) => {
	const [images, setImages] = useState<Record<ImageSection, string>>({
		top: "",
		bottom: ""
	})
	
	const topInputRef = useRef<HTMLInputElement>(null)
	const bottomInputRef = useRef<HTMLInputElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const handleButtonClick = (section: ImageSection) => {
		if (section === "top" && topInputRef.current) {
			topInputRef.current.click()
		} else if (section === "bottom" && bottomInputRef.current) {
			bottomInputRef.current.click()
		}
	}

	const handleImageUpload = (section: ImageSection, event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			const imageUrl = URL.createObjectURL(file)
			setImages(prev => ({
				...prev,
				[section]: imageUrl
			}))
		}
	}

	const getCoverDimensions = (imgWidth: number, imgHeight: number, targetWidth: number, targetHeight: number) => {
		const scale = Math.max(targetWidth / imgWidth, targetHeight / imgHeight)
		const newWidth = imgWidth * scale
		const newHeight = imgHeight * scale
		const x = (targetWidth - newWidth) / 2
		const y = (targetHeight - newHeight) / 2
		return { width: newWidth, height: newHeight, x, y }
	}

	const downloadMeme = async () => {
		if (!canvasRef.current || !images.top || !images.bottom) return

		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const CANVAS_WIDTH = 1080
		const CANVAS_HEIGHT = 1080
		const SECTION_HEIGHT = CANVAS_HEIGHT / 2

		canvas.width = CANVAS_WIDTH
		canvas.height = CANVAS_HEIGHT

		// Set canvas background to white
		ctx.fillStyle = 'white'
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

		// Load all images first
		const loadImage = (src: string): Promise<HTMLImageElement> => {
			return new Promise((resolve, reject) => {
				const img = new Image()
				img.onload = () => resolve(img)
				img.onerror = reject
				img.src = src
			})
		}

		try {
			// Load all images in parallel
			const [topImage, bottomImage, overlayImage] = await Promise.all([
				loadImage(images.top),
				loadImage(images.bottom),
				overlayImageUrl ? loadImage(overlayImageUrl) : null
			])

			// Draw top image with cover behavior
			const topWidth = CANVAS_WIDTH - (topImageMargins.left || 0) - (topImageMargins.right || 0)
			const topHeight = SECTION_HEIGHT - (topImageMargins.top || 0) - (topImageMargins.bottom || 0)
			const topDimensions = getCoverDimensions(
				topImage.width,
				topImage.height,
				topWidth,
				topHeight
			)
			ctx.save()
			ctx.beginPath()
			ctx.rect(
				topImageMargins.left || 0,
				topImageMargins.top || 0,
				topWidth,
				topHeight
			)
			ctx.clip()
			ctx.drawImage(
				topImage,
				(topImageMargins.left || 0) + topDimensions.x,
				(topImageMargins.top || 0) + topDimensions.y,
				topDimensions.width,
				topDimensions.height
			)
			ctx.restore()
			
			// Draw bottom image with cover behavior
			const bottomWidth = CANVAS_WIDTH - (bottomImageMargins.left || 0) - (bottomImageMargins.right || 0)
			const bottomHeight = SECTION_HEIGHT - (bottomImageMargins.top || 0) - (bottomImageMargins.bottom || 0)
			const bottomDimensions = getCoverDimensions(
				bottomImage.width,
				bottomImage.height,
				bottomWidth,
				bottomHeight
			)
			ctx.save()
			ctx.beginPath()
			ctx.rect(
				bottomImageMargins.left || 0,
				SECTION_HEIGHT + (bottomImageMargins.top || 0),
				bottomWidth,
				bottomHeight
			)
			ctx.clip()
			ctx.drawImage(
				bottomImage,
				(bottomImageMargins.left || 0) + bottomDimensions.x,
				SECTION_HEIGHT + (bottomImageMargins.top || 0) + bottomDimensions.y,
				bottomDimensions.width,
				bottomDimensions.height
			)
			ctx.restore()
			
			// Draw overlay if exists
			if (overlayImage) {
				ctx.drawImage(overlayImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
			}

			// Convert to blob and download
			const blob = await new Promise<Blob>((resolve) => 
				canvas.toBlob((blob) => resolve(blob as Blob), 'image/png', 1.0)
			)
			
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = 'meme.png'
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)
		} catch (error) {
			console.error('Error generating meme:', error)
		}
	}

	const canDownload = images.top && images.bottom

	const topSectionStyle = {
		marginTop: topImageMargins.top || 0,
		marginBottom: topImageMargins.bottom || 0,
		marginLeft: topImageMargins.left || 0,
		marginRight: topImageMargins.right || 0,
	}

	const bottomSectionStyle = {
		marginTop: bottomImageMargins.top || 0,
		marginBottom: bottomImageMargins.bottom || 0,
		marginLeft: bottomImageMargins.left || 0,
		marginRight: bottomImageMargins.right || 0,
	}

	return (
		<div className={styles.container}>
			{overlayImageUrl && (
				<img 
					src={overlayImageUrl} 
					alt="Overlay" 
					className={styles.overlay}
				/>
			)}
			<div className={styles.section} style={topSectionStyle}>
				{images.top ? (
					<img 
						src={images.top} 
						alt="Top section" 
						className={styles.image}
						onClick={() => handleButtonClick("top")}
						title="Click to replace image"
					/>
				) : (
					<button 
						className={styles.addButton}
						onClick={() => handleButtonClick("top")}
					>
						+
					</button>
				)}
				<input
					ref={topInputRef}
					type="file"
					accept="image/*"
					className={styles.fileInput}
					onChange={(e) => handleImageUpload("top", e)}
				/>
			</div>
			<div className={styles.section} style={bottomSectionStyle}>
				{images.bottom ? (
					<img 
						src={images.bottom} 
						alt="Bottom section" 
						className={styles.image}
						onClick={() => handleButtonClick("bottom")}
						title="Click to replace image"
					/>
				) : (
					<button 
						className={styles.addButton}
						onClick={() => handleButtonClick("bottom")}
					>
						+
					</button>
				)}
				<input
					ref={bottomInputRef}
					type="file"
					accept="image/*"
					className={styles.fileInput}
					onChange={(e) => handleImageUpload("bottom", e)}
				/>
			</div>
			<canvas ref={canvasRef} style={{ display: 'none' }} />
			<button 
				className={styles.downloadButton}
				onClick={downloadMeme}
				disabled={!canDownload}
			>
				Pobierz
			</button>
		</div>
	)
}

export default MemeGenerator 
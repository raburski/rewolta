// Utility function to resize image and reduce file size
export const resizeImage = (file: File, maxWidth: number = 1024, maxHeight: number = 1024, quality: number = 0.8): Promise<Blob> => {
	return new Promise((resolve) => {
		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')
		const img = new Image()
		
		img.onload = () => {
			// Calculate new dimensions while maintaining aspect ratio
			let { width, height } = img
			
			if (width > maxWidth) {
				height = (height * maxWidth) / width
				width = maxWidth
			}
			
			if (height > maxHeight) {
				width = (width * maxHeight) / height
				height = maxHeight
			}
			
			// Set canvas dimensions
			canvas.width = width
			canvas.height = height
			
			// Draw resized image
			ctx?.drawImage(img, 0, 0, width, height)
			
			// Convert to blob with specified quality
			canvas.toBlob((blob) => {
				if (blob) {
					resolve(blob)
				}
			}, 'image/jpeg', quality)
		}
		
		img.src = URL.createObjectURL(file)
	})
}

// Utility function to check file size and resize if needed
export const processImageFile = async (file: File): Promise<{ blob: Blob; wasResized: boolean }> => {
	const MAX_SIZE = 1.2 * 1024 * 1024 // 1.2MB in bytes
	
	if (file.size <= MAX_SIZE) {
		return { blob: file, wasResized: false }
	}
	
	console.log(`Image too large (${(file.size / 1024 / 1024).toFixed(2)}MB), resizing...`)
	const resizedBlob = await resizeImage(file)
	console.log(`Resized to ${(resizedBlob.size / 1024 / 1024).toFixed(2)}MB`)
	
	return { blob: resizedBlob, wasResized: true }
} 
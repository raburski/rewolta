/**
 * Downloads an image from a URL as a file
 * @param imageUrl - The URL of the image to download
 * @param filename - The filename for the downloaded file
 */
export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
	try {
		// Fetch the image as a blob
		const response = await fetch(imageUrl)
		if (!response.ok) {
			throw new Error('Failed to fetch image')
		}

		const blob = await response.blob()
		
		// Create a blob URL
		const blobUrl = window.URL.createObjectURL(blob)
		
		// Create download link
		const link = document.createElement('a')
		link.href = blobUrl
		link.download = filename
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		
		// Clean up blob URL
		window.URL.revokeObjectURL(blobUrl)
	} catch (error) {
		console.error('Error downloading image:', error)
		// Fallback to direct link if blob download fails
		const link = document.createElement('a')
		link.href = imageUrl
		link.download = filename
		link.target = '_blank'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}
} 
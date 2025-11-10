import { BunnyCDNClient } from '@raburski/bunny-cdn-client'

const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE
const BUNNY_API_KEY = process.env.BUNNY_API_KEY
const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL
const BUNNY_PULL_ZONE_URL = process.env.BUNNY_PULL_ZONE_URL

if (!BUNNY_STORAGE_ZONE || !BUNNY_API_KEY || !BUNNY_CDN_URL || !BUNNY_PULL_ZONE_URL) {
	console.warn('Bunny CDN environment variables are not configured')
}

const client = BUNNY_STORAGE_ZONE && BUNNY_API_KEY && BUNNY_CDN_URL && BUNNY_PULL_ZONE_URL
	? new BunnyCDNClient({
		storageZone: BUNNY_STORAGE_ZONE,
		apiKey: BUNNY_API_KEY,
		cdnUrl: BUNNY_CDN_URL,
		pullZoneUrl: BUNNY_PULL_ZONE_URL,
	})
	: null

export async function uploadToBunnyCDN(
	file: Buffer | Uint8Array,
	fileName: string,
	contentType: string = 'image/jpeg'
): Promise<string> {
	if (!client) {
		throw new Error('Bunny CDN is not configured')
	}

	if (!BUNNY_PULL_ZONE_URL) {
		throw new Error('BUNNY_PULL_ZONE_URL is not configured')
	}

	try {
		const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file)
		const result = await client.uploadBuffer(buffer, fileName, contentType)
		
		if (!result.success) {
			throw new Error(result.error || 'Upload failed')
		}

		return result.url || `${BUNNY_PULL_ZONE_URL}/${fileName}`
	} catch (error) {
		console.error('Error uploading to Bunny CDN:', error)
		throw new Error('Failed to upload file to Bunny CDN')
	}
}

export async function createThumbnail(
	imageBuffer: Buffer,
	maxWidth: number = 400,
	maxHeight: number = 400,
	quality: number = 0.85
): Promise<Buffer> {
	// Dynamic import to avoid bundling sharp in client
	const sharp = await import('sharp')
	
	return await sharp.default(imageBuffer)
		.resize(maxWidth, maxHeight, {
			fit: 'inside',
			withoutEnlargement: true,
		})
		.jpeg({ quality: Math.round(quality * 100) })
		.toBuffer()
}


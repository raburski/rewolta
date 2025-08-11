import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const IMGEN_PROXY_URL = process.env.IMGEN_PROXY_URL || 'https://your-imgen-proxy-url.com'
const IMGEN_PROXY_API_KEY = process.env.IMGEN_PROXY_API_KEY
const PRODUCT_ID = 'museum'

const CALL_PROMPT = `You are an expert in architectural visualization.

Your task is to apply the visual style of Image B (facade material, textures, window style, surface detailing) to the structure of Image A, while strictly preserving all aspects of Image A's physical form.

Instructions:
	•	Use Image A (the museum render) as the base.
	•	Do not change its structure: keep the number of storeys, all window placements, proportions, and especially the asymmetrical massing — with receding upper floors on one side and a flat facade on the other.
	•	Ignore any temporary exhibits, sculptural fragments, or free-standing objects visible in front of or next to the building — they are not part of the architectural structure and should be excluded from the style transfer.
	•	Apply only visual changes from Image B:
	•	Brick or stone texture
	•	Type and style of windows
	•	Surface materials, color, ornament, arches, or cornices
	•	Do not modify the structure, depth, or proportions of the original building in Image A.

Keep the lighting, camera perspective, and urban context from Image A. The result should look like a stylistic reinterpretation of the museum building, without altering its form or incorporating unrelated exhibit elements.`

export async function POST(request: NextRequest) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			)
		}

		const { inputBase64Image, enhancedPrompt } = await request.json()

		if (!inputBase64Image) {
			return NextResponse.json(
				{ error: 'Missing required parameter: inputBase64Image' },
				{ status: 400 }
			)
		}

		if (!IMGEN_PROXY_API_KEY) {
			console.error('IMGEN_PROXY_API_KEY not configured')
			return NextResponse.json(
				{ error: 'Image generation service not configured' },
				{ status: 500 }
			)
		}

		// Use default prompt if none provided
		const prompt = enhancedPrompt || CALL_PROMPT

		// Get museum image URL
		const baseUrl = 'https://rewolta.org' //process.env.NEXTAUTH_URL || 'https://rewolta.org'
		const museumImageUrl = `${baseUrl}/assets/museum-small.png`
		console.log('Using museum image URL:', museumImageUrl)

		// Sanitize ownerId
		const rawOwnerId = session.user?.id || session.user?.email || 'unknown'
		const ownerId = rawOwnerId
			.replace(/[^a-zA-Z0-9@._-]/g, '') // Remove special characters except email-safe ones
			.replace(/@/g, '_') // Replace @ with _
			.replace(/\./g, '_') // Replace . with _
			.substring(0, 100) // Limit length
			.toLowerCase() // Normalize to lowercase

		// Prepare the request for imgen-proxy using GPT-4.1 with image generation
		const imgenRequest = {
			model: 'gpt-4.1',
			ownerId: ownerId,
			productId: PRODUCT_ID,
			input: [
				{
					role: "system",
					content: "You are a building visual editor. You must follow structural constraints exactly and only apply stylistic detailing on top of the original structure."
				},
				{
					role: 'user',
					content: [
						{ type: 'input_text', text: prompt },
						{ type: 'input_image', image_url: museumImageUrl },
						{ type: 'input_image', image_url: `data:image/jpeg;base64,${inputBase64Image}` }
					]
				}
			],
			tools: [{ type: 'image_generation' }]
		}

		console.log('Starting image generation job with imgen-proxy...')
		
		const response = await fetch(`${IMGEN_PROXY_URL}/api/v1/images/generate`, {
			method: 'POST',
			headers: {
				'x-api-key': IMGEN_PROXY_API_KEY,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(imgenRequest)
		})

		if (!response.ok) {
			const errorData = await response.json()
			console.error('imgen-proxy error:', errorData)
			throw new Error(`imgen-proxy error: ${response.status}`)
		}

		const data = await response.json()
		console.log('Job started successfully:', data)

		if (!data.success || !data.data?.jobId) {
			throw new Error('Invalid response from imgen-proxy')
		}

		return NextResponse.json({ 
			jobId: data.data.jobId,
			status: data.data.status,
			message: data.data.message
		})
	} catch (error) {
		console.error('Error in generate-building API:', `${IMGEN_PROXY_URL}/api/v1/images/generate`, error)
		return NextResponse.json(
			{ error: 'Failed to start image generation' },
			{ status: 500 }
		)
	}
} 
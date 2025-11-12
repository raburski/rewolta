import { NextResponse } from 'next/server'
import '@/lib/authUtils'
import { withPermission } from '@raburski/next-auth-permissions/server'
import { getBuildingProductById } from '@/lib/buildingProductUtils'
import { ensureHttpsUrl } from '@/lib/urlUtils'
import { Permission } from '@/lib/permissions'
import { APIHandler, compose } from '@raburski/next-api-middleware'
import { requireUserCan } from '@raburski/next-auth-permissions/server'
import { CUSTOM_PRODUCT_ID } from '@/lib/constants'

const IMGEN_PROXY_URL = ensureHttpsUrl(process.env.IMGEN_PROXY_URL || 'https://your-imgen-proxy-url.com')
const IMGEN_PROXY_API_KEY = process.env.IMGEN_PROXY_API_KEY

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

	const handler: APIHandler = async (request, context) => {
	try {
		const { session } = context

		const { inputBase64Image, enhancedPrompt, productId, customBuildingBase64Image } = await request.json()

		if (!inputBase64Image) {
			return NextResponse.json(
				{ error: 'Missing required parameter: inputBase64Image' },
				{ status: 400 }
			)
		}

		// Validate custom building image permission if provided
		if (customBuildingBase64Image) {
			const { error: permissionError } = await requireUserCan(Permission.IMAGE_GENERATION_CUSTOM, context)
			if (permissionError) {
				return NextResponse.json(
					{ error: 'Unauthorized: Custom building images not allowed' },
					{ status: 403 }
				)
			}
		}

		// Either productId or customBuildingBase64Image must be provided
		if (!productId && !customBuildingBase64Image) {
			return NextResponse.json(
				{ error: 'Missing required parameter: productId or customBuildingBase64Image' },
				{ status: 400 }
			)
		}

		// Get product data (only if not using custom building)
		let product = null
		let referenceImageUrl: string
		
		if (customBuildingBase64Image) {
			// Use custom building image
			referenceImageUrl = `data:image/jpeg;base64,${customBuildingBase64Image}`
		} else {
			// Use product image
			const userRole = session.user?.role
			product = await getBuildingProductById(productId, userRole)
			if (!product) {
				return NextResponse.json(
					{ error: 'Invalid productId' },
					{ status: 400 }
				)
			}
			referenceImageUrl = product.cdnUrl
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

		// Sanitize ownerId
		const rawOwnerId = session.user?.id || session.user?.email || 'unknown'
		const ownerId = rawOwnerId
			.replace(/[^a-zA-Z0-9@._-]/g, '') // Remove special characters except email-safe ones
			.replace(/@/g, '_') // Replace @ with _
			.replace(/\./g, '_') // Replace . with _
			.substring(0, 100) // Limit length
			.toLowerCase() // Normalize to lowercase

		// Use CUSTOM_PRODUCT_ID when using custom building image, otherwise use the provided productId
		// The imgen-proxy must accept CUSTOM_PRODUCT_ID as a valid productId value
		const finalProductId = customBuildingBase64Image ? CUSTOM_PRODUCT_ID : productId


		// Prepare the request for imgen-proxy using GPT-4.1 with image generation
		const imgenRequest = {
			model: 'gpt-4.1',
			ownerId: ownerId,
			productId: finalProductId, // Will be "custom" when using custom building image
			input: [
				{
					role: "system",
					content: "You are a building visual editor. You must follow structural constraints exactly and only apply stylistic detailing on top of the original structure."
				},
				{
					role: 'user',
					content: [
						{ type: 'input_text', text: prompt },
						{ type: 'input_image', image_url: referenceImageUrl },
						{ type: 'input_image', image_url: `data:image/jpeg;base64,${inputBase64Image}` }
					]
				}
			],
			tools: [{ type: 'image_generation' }],
			aspectRatio: '3:2' // Set aspect ratio to 3:2 (landscape)
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

export const POST = compose(
	withPermission(Permission.IMAGE_GENERATION_EXECUTE)
)(handler) 
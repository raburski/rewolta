import { NextRequest, NextResponse } from 'next/server'
import { callOpenAI } from '@/lib/openai'

const CALL_PROMPT = `You are an expert in architectural visualization.

Your task is to apply the visual style of Image B (facade material, textures, window style, surface detailing) to the structure of Image A, while strictly preserving all aspects of Image A’s physical form.

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
		const { inputBase64Image, enhancedPrompt } = await request.json()

		if (!inputBase64Image) {
			return NextResponse.json(
				{ error: 'Missing required parameter: inputBase64Image' },
				{ status: 400 }
			)
		}

		// Use default prompt if none provided
		const prompt = CALL_PROMPT

		// Get museum image URL
		const baseUrl = process.env.NEXTAUTH_URL || 'https://rewolta.org'
		const museumImageUrl = `${baseUrl}/assets/museum-small.png`
		console.log('Using museum image URL:', museumImageUrl)

		const gptRequest = {
			model: 'gpt-4.1',
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

		console.log('Making OpenAI API call...')
		const gptData = await callOpenAI({
			endpoint: 'https://api.openai.com/v1/responses',
			apiKey: process.env.OPENAI_API_KEY,
			body: gptRequest
		})

		console.log('OpenAI response received:', Object.keys(gptData))

		const imageData = gptData.output
			?.filter((output: any) => output.type === 'image_generation_call')
			?.map((output: any) => output.result)

		if (!imageData || imageData.length === 0) {
			console.error('❌ No image generated in GPT-4.1 response')
			return NextResponse.json(
				{ error: 'No image generated in response' },
				{ status: 500 }
			)
		}

		const imageBase64 = imageData[0]
		const dataUrl = `data:image/png;base64,${imageBase64}`

		console.log('✅ Image generated successfully')

		return NextResponse.json({ result: dataUrl })
	} catch (error) {
		console.error('Error in generate-building API:', error)
		return NextResponse.json(
			{ error: 'Failed to generate building' },
			{ status: 500 }
		)
	}
} 
import { NextRequest, NextResponse } from 'next/server'
import '@/lib/authUtils'
import { requireUserCan } from '@raburski/next-auth-permissions/server'
import { Permission } from '@/lib/permissions'
import { ensureHttpsUrl } from '@/lib/urlUtils'

const IMGEN_PROXY_URL = ensureHttpsUrl(process.env.IMGEN_PROXY_URL || 'https://your-imgen-proxy-url.com')
const IMGEN_PROXY_API_KEY = process.env.IMGEN_PROXY_API_KEY

export async function GET(
	request: NextRequest,
	{ params }: { params: { jobId: string } }
) {
	try {
		// Check authentication
		const { session, error } = await requireUserCan(Permission.IMAGE_GENERATION_EXECUTE, request)
		if (error || !session) {
			return error ?? NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			)
		}

		const { jobId } = params

		if (!jobId) {
			return NextResponse.json(
				{ error: 'Missing job ID' },
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

		console.log(`Checking status for job: ${jobId}`)

		const response = await fetch(`${IMGEN_PROXY_URL}/api/v1/images/job/${jobId}`, {
			method: 'GET',
			headers: {
				'x-api-key': IMGEN_PROXY_API_KEY,
				'Cache-Control': 'no-cache',
				'Pragma': 'no-cache'
			}
		})

		if (!response.ok) {
			const errorData = await response.json()
			console.error('imgen-proxy status check error:', errorData)
			throw new Error(`imgen-proxy error: ${response.status}`)
		}

		const data = await response.json()
		console.log('Job status received:', data)

		if (!data.success) {
			throw new Error('Invalid response from imgen-proxy')
		}

		const jobData = data.data

		// If job is completed, return the image data
		if (jobData.status === 'completed' && jobData.result) {
			// Handle imgen-proxy format with imageUrl
			if (jobData.result.imageUrl) {
				return NextResponse.json({
					id: jobData.result.id,
					status: jobData.status,
					imageUrl: jobData.result.imageUrl
				})
			}
			
			// Handle GPT-4.1 response format
			const imageData = jobData.result.output
				?.filter((output: any) => output.type === 'image_generation_call')
				?.map((output: any) => output.result)

			if (imageData && imageData.length > 0) {
				const imageBase64 = imageData[0]
				const dataUrl = `data:image/png;base64,${imageBase64}`
				
				return NextResponse.json({
					id: jobData.id,
					status: jobData.status,
					imageUrl: dataUrl
				})
			}
			
			// Fallback for DALL-E format
			if (jobData.result?.data?.[0]?.url) {
				return NextResponse.json({
					status: jobData.status,
					imageUrl: jobData.result.data[0].url
				})
			}
		}

		// If job is still in progress
		return NextResponse.json({
			status: jobData.status,
		})

	} catch (error) {
		console.error('Error checking job status:', error)
		return NextResponse.json(
			{ error: 'Failed to check job status' },
			{ status: 500 }
		)
	}
} 
import { NextResponse } from 'next/server'
import { APIHandler } from '@raburski/next-api-middleware'

export const GET: APIHandler = async (request, context) => {
	return NextResponse.json({
		message: 'User API',
		endpoints: {
			credits: '/api/user/credits',
			images: '/api/user/images/[productId]'
		},
		description: 'Unified user-related API endpoints'
	})
} 
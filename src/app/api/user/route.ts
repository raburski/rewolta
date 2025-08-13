import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	return NextResponse.json({
		message: 'User API',
		endpoints: {
			credits: '/api/user/credits',
			images: '/api/user/images/[productId]'
		},
		description: 'Unified user-related API endpoints'
	})
} 
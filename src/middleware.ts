import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
	// Ensure permissions are configured for API routes
	if (request.nextUrl.pathname.startsWith('/api')) {
		// Dynamically import authUtils to ensure permissions are configured
		// This will execute configurePermissions() at module load time
		await import('@/lib/authUtils')
	}

	return NextResponse.next()
}

export const config = {
	matcher: '/api/:path*',
}


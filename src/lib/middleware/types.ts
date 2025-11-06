import { NextRequest, NextResponse } from "next/server"

// Generic context type that includes session and resource
export type APIContext<T = any> = {
	params: Promise<Record<string, string>>
	session?: any
	resource?: T
	pagination?: PaginationParams // if using pagination
}

// Generic handler function type for all API endpoints
export type APIHandler<T = any> = (
	request: NextRequest,
	context: APIContext<T>
) => Promise<NextResponse>

// Middleware function type that transforms a handler
export type Middleware = <T = any>(
	handler: APIHandler<T>
) => APIHandler<T>

// Pagination parameters (optional, for future use)
export type PaginationParams = {
	page?: number
	limit?: number
}


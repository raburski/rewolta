import { NextRequest, NextResponse } from "next/server"
import "@/lib/authUtils"
import { requireAuth, requireUserCan } from "@raburski/next-auth-permissions/server"
import { Permission } from "@/lib/permissions"
import { Middleware, APIHandler, APIContext } from "./types"

// Middleware that requires authentication only
export const withAuth: Middleware = <T>(handler: APIHandler<T>): APIHandler<T> => {
	return async (request: NextRequest, context: APIContext<T>): Promise<NextResponse> => {
		const { session: validatedSession, error } = await requireAuth(request)
		if (error) {
			return error
		}
		
		// Add the validated session to the context
		const newContext: APIContext<T> = {
			...context,
			session: validatedSession
		}
		
		return handler(request, newContext)
	}
}

// Middleware that requires a specific permission
export const withPermission = (permission: Permission): Middleware => {
	return <T>(handler: APIHandler<T>): APIHandler<T> => {
		return async (request: NextRequest, context: APIContext<T>): Promise<NextResponse> => {
			const { session: validatedSession, error } = await requireUserCan(permission, request)
			if (error) {
				return error
			}
			
			// Add the validated session to the context
			const newContext: APIContext<T> = {
				...context,
				session: validatedSession
			}
			
			return handler(request, newContext)
		}
	}
}


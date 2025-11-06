import { NextRequest, NextResponse } from "next/server"
import { Middleware, APIHandler, APIContext } from "./types"

export const withResourceExists = <T>(
	finder: (id: string) => Promise<T | null>,
	resourceName: string
): Middleware => {
	return <U>(handler: APIHandler<U>): APIHandler<U> => {
		return async (request: NextRequest, context: APIContext<U>): Promise<NextResponse> => {
			const params = await context.params
			const { id } = params as { id: string }
			const resource = await finder(id)
			
			if (!resource) {
				return NextResponse.json(
					{ message: `${resourceName} not found` },
					{ status: 404 }
				)
			}
			
			// Add the resource to the context
			const newContext: APIContext<U> = {
				...context,
				resource: resource as U
			}
			
			return handler(request, newContext)
		}
	}
}


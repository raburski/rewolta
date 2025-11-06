import { Middleware, APIHandler } from "./types"

// Utility for composing middleware functions
// Middleware is applied right-to-left (last middleware wraps first)
export const compose = <T = any>(
	...middlewares: Middleware[]
) => {
	return (handler: APIHandler<T>): APIHandler<T> => {
		return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
	}
}


import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"
import { UserStatus } from "@/types/user"
import { Permission, userCan } from "./permissions"
import { authOptions } from "./auth"

export async function requireAuth(request?: NextRequest) {
	// In Next.js App Router, getServerSession automatically reads from cookies
	// The request parameter is kept for future compatibility but not used
	const session = await getServerSession(authOptions)
	
	if (!session?.user) {
		return {
			error: NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			),
			session: null,
		}
	}

	return { session, error: null }
}

export async function requireUserCan(permission: Permission, request?: NextRequest) {
	const { session, error } = await requireAuth(request)
	
	if (error) {
		return { error, session: null }
	}

	// Check if user is active (not banned)
	if (session?.user.status !== UserStatus.ACTIVE) {
		return {
			error: NextResponse.json(
				{ message: "Your account has been banned" },
				{ status: 403 }
			),
			session: null,
		}
	}

	// Check if user has the required permission
	if (!userCan(session.user.role, permission)) {
		return {
			error: NextResponse.json(
				{ message: "Insufficient permissions" },
				{ status: 403 }
			),
			session: null,
		}
	}

	return { session, error: null }
} 
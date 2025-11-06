import { useSession } from "next-auth/react"
import { Permission, userCan } from "@/lib/permissions"

export function useUserCan(permission: Permission): boolean {
	const { data: session } = useSession()
	
	if (!session?.user?.role) {
		return false
	}
	
	return userCan(session.user.role, permission)
}

export function useUserCanAny(permissions: Permission[]): boolean {
	const { data: session } = useSession()
	
	if (!session?.user?.role) {
		return false
	}
	
	return permissions.some(permission => userCan(session.user.role, permission))
}

export function useUserCanAll(permissions: Permission[]): boolean {
	const { data: session } = useSession()
	
	if (!session?.user?.role) {
		return false
	}
	
	return permissions.every(permission => userCan(session.user.role, permission))
}


import {
	useUserCan as baseUseUserCan,
	useUserCanAny as baseUseUserCanAny,
	useUserCanAll as baseUseUserCanAll,
} from "@raburski/next-auth-permissions/client"
import { Permission } from "@/lib/permissions"

export function useUserCan(permission: Permission): boolean {
	return baseUseUserCan<Permission>(permission)
}

export function useUserCanAny(permissions: Permission[]): boolean {
	return baseUseUserCanAny<Permission>(permissions)
}

export function useUserCanAll(permissions: Permission[]): boolean {
	return baseUseUserCanAll<Permission>(permissions)
}
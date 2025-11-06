import { UserRole } from '@/types/user'

// Define all available permissions as an enum
export enum Permission {
	// Resource management permissions (example pattern)
	RESOURCE_ADD = "resource.add",
	RESOURCE_APPROVE = "resource.approve",
	RESOURCE_EDIT = "resource.edit",
	RESOURCE_DELETE = "resource.delete",
	
	// Content management permissions (example pattern)
	CONTENT_ADD = "content.add",
	CONTENT_DELETE = "content.delete",
	
	// User management permissions (example pattern)
	USER_LIST_VIEW = "users.list_view",
	USER_DETAILS_VIEW = "users.details_view",
	USERS_EDIT_STATUS = "users.edit_status",
	USERS_EDIT_ROLE = "users.edit_role",
	
	// Admin permissions
	ADMIN_DASHBOARD = "admin.dashboard",
	
	// Configuration permissions (example pattern)
	OPTIONS_ADD = "options.add",
	OPTIONS_EDIT = "options.edit",
	OPTIONS_DELETE = "options.delete",
}

// Map roles to their granted permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
	[UserRole.USER]: [
		Permission.RESOURCE_ADD,
		Permission.CONTENT_ADD,
	],
	[UserRole.MODERATOR]: [
		Permission.RESOURCE_ADD,
		Permission.CONTENT_ADD,
		Permission.RESOURCE_APPROVE,
		Permission.RESOURCE_EDIT,
		Permission.CONTENT_DELETE,
		Permission.USER_LIST_VIEW,
		Permission.USER_DETAILS_VIEW,
		Permission.USERS_EDIT_STATUS,
		Permission.ADMIN_DASHBOARD,
	],
	[UserRole.ADMIN]: [
		Permission.RESOURCE_ADD,
		Permission.CONTENT_ADD,
		Permission.RESOURCE_APPROVE,
		Permission.RESOURCE_EDIT,
		Permission.RESOURCE_DELETE,
		Permission.CONTENT_DELETE,
		Permission.USER_LIST_VIEW,
		Permission.USER_DETAILS_VIEW,
		Permission.USERS_EDIT_STATUS,
		Permission.USERS_EDIT_ROLE,
		Permission.ADMIN_DASHBOARD,
		Permission.OPTIONS_ADD,
		Permission.OPTIONS_EDIT,
		Permission.OPTIONS_DELETE,
	],
}

// Check if a role has a specific permission
export function userCan(userRole: string, permission: Permission): boolean {
	const permissions = ROLE_PERMISSIONS[userRole] || []
	return permissions.includes(permission)
}

// Check if a role has any of the specified permissions
export function userCanAny(userRole: string, permissions: Permission[]): boolean {
	return permissions.some(permission => userCan(userRole, permission))
}

// Check if a role has all of the specified permissions
export function userCanAll(userRole: string, permissions: Permission[]): boolean {
	return permissions.every(permission => userCan(userRole, permission))
}


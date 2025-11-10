import { UserRole } from '@/types/user'

export enum Permission {
	BUILDING_PRODUCTS_VIEW_ALL = "buildingProducts.viewAll",
	BUILDING_PRODUCTS_MANAGE = "buildingProducts.manage",
	IMAGE_GENERATION_EXECUTE = "imageGeneration.execute",
	ADMIN_DASHBOARD = "admin.dashboard",
	USERS_VIEW = "users.view",
	USERS_MANAGE = "users.manage",
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
	[UserRole.USER]: [
		Permission.IMAGE_GENERATION_EXECUTE,
	],
	[UserRole.MODERATOR]: [
		Permission.IMAGE_GENERATION_EXECUTE,
		Permission.BUILDING_PRODUCTS_VIEW_ALL,
	],
	[UserRole.ADMIN]: [
		Permission.IMAGE_GENERATION_EXECUTE,
		Permission.BUILDING_PRODUCTS_VIEW_ALL,
		Permission.BUILDING_PRODUCTS_MANAGE,
		Permission.ADMIN_DASHBOARD,
		Permission.USERS_VIEW,
		Permission.USERS_MANAGE,
	],
}


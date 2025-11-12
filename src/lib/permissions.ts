import { UserRole } from '@/types/user'

export enum Permission {
	BUILDING_PRODUCTS_VIEW_ALL = "buildingProducts.viewAll",
	BUILDING_PRODUCTS_MANAGE = "buildingProducts.manage",
	IMAGE_GENERATION_EXECUTE = "imageGeneration.execute",
	ADMIN_DASHBOARD = "admin.dashboard",
	USERS_VIEW = "users.view",
	USERS_MANAGE = "users.manage",
	USERS_SET_CREDITS = "users.setCredits",
	SUBMISSIONS_CREATE = "submissions.create",
	SUBMISSIONS_VIEW = "submissions.view",
	SUBMISSIONS_WITHDRAW = "submissions.withdraw",
	COMPARISONS_CREATE = "comparisons.create",
	RANKINGS_VIEW = "rankings.view",
	SUBMISSIONS_MODERATE = "submissions.moderate",
	IMAGE_GENERATION_CUSTOM = "imageGeneration.custom",
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
	[UserRole.USER]: [
		Permission.IMAGE_GENERATION_EXECUTE,
		Permission.SUBMISSIONS_CREATE,
		Permission.COMPARISONS_CREATE,
		Permission.RANKINGS_VIEW,
	],
	[UserRole.CREATOR]: [
		Permission.IMAGE_GENERATION_EXECUTE,
		Permission.IMAGE_GENERATION_CUSTOM,
		Permission.SUBMISSIONS_CREATE,
		Permission.COMPARISONS_CREATE,
		Permission.RANKINGS_VIEW,
	],
	[UserRole.MODERATOR]: [
		Permission.IMAGE_GENERATION_EXECUTE,
		Permission.BUILDING_PRODUCTS_VIEW_ALL,
		Permission.SUBMISSIONS_CREATE,
		Permission.SUBMISSIONS_VIEW,
		Permission.COMPARISONS_CREATE,
		Permission.RANKINGS_VIEW,
	],
	[UserRole.ADMIN]: [
		Permission.IMAGE_GENERATION_EXECUTE,
		Permission.IMAGE_GENERATION_CUSTOM,
		Permission.BUILDING_PRODUCTS_VIEW_ALL,
		Permission.BUILDING_PRODUCTS_MANAGE,
		Permission.ADMIN_DASHBOARD,
		Permission.USERS_VIEW,
		Permission.USERS_MANAGE,
		Permission.USERS_SET_CREDITS,
		Permission.SUBMISSIONS_CREATE,
		Permission.SUBMISSIONS_VIEW,
		Permission.SUBMISSIONS_WITHDRAW,
		Permission.COMPARISONS_CREATE,
		Permission.RANKINGS_VIEW,
		Permission.SUBMISSIONS_MODERATE,
	],
}


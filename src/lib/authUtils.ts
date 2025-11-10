import { configurePermissions } from "@raburski/next-auth-permissions/server"
import { auth } from "@/lib/auth"
import { UserStatus } from "@/types/user"
import { ROLE_PERMISSIONS } from "./permissions"

configurePermissions({
	auth: () => auth(),
	rolePermissions: ROLE_PERMISSIONS,
	activeStatus: UserStatus.ACTIVE,
	messages: {
		unauthorized: "Unauthorized",
		banned: "Your account has been banned",
		insufficientPermissions: "Insufficient permissions",
	},
})

export {}
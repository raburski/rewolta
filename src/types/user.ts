export const UserRole = {
	USER: 'USER',
	MODERATOR: 'MODERATOR',
	ADMIN: 'ADMIN',
	CREATOR: 'CREATOR',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const UserStatus = {
	ACTIVE: 'ACTIVE',
	BANNED: 'BANNED',
	DELETED: 'DELETED',
} as const

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

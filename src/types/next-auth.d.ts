import NextAuth from 'next-auth'
import { UserRole, UserStatus } from '@/types/user'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			name?: string | null
			email?: string | null
			image?: string | null
			role: UserRole
			status: UserStatus
		}
	}

	interface User {
		role: UserRole
		status: UserStatus
	}
}

declare module '@auth/core/adapters' {
	interface AdapterUser {
		role: UserRole
		status: UserStatus
	}
} 
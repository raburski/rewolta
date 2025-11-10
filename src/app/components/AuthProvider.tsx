'use client'

import { SessionProvider } from 'next-auth/react'
import { PermissionsProvider } from '@raburski/next-auth-permissions/client'
import { ROLE_PERMISSIONS } from '@/lib/permissions'

interface AuthProviderProps {
	children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
	return (
		<SessionProvider>
			<PermissionsProvider rolePermissions={ROLE_PERMISSIONS}>
				{children}
			</PermissionsProvider>
		</SessionProvider>
	)
}
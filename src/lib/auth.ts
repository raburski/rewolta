import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import DiscordProvider from 'next-auth/providers/discord'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		DiscordProvider({
			clientId: process.env.DISCORD_CLIENT_ID!,
			clientSecret: process.env.DISCORD_CLIENT_SECRET!,
		}),
	],
	session: {
		strategy: 'database' as const,
		maxAge: 30 * 24 * 60 * 60, // 30 days (default is 24 hours)
		updateAge: 24 * 60 * 60, // 24 hours (default is 1 hour)
	},
	useSecureCookies: process.env.NODE_ENV === 'production',
	cookies: {
		sessionToken: {
			name: `next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 30 * 24 * 60 * 60, // 30 days
			}
		}
	},
	callbacks: {
		async session({ session, user }) {
			if (session.user) {
				session.user.id = user.id
				session.user.role = user.role
				session.user.status = user.status
			}
			return session
		}
	}
}

export default NextAuth(authOptions) 
import NextAuth from 'next-auth'
import FacebookProvider from 'next-auth/providers/facebook'

export const authOptions = {
	providers: [
		FacebookProvider({
			clientId: process.env.FACEBOOK_CLIENT_ID!,
			clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
			}
			return token
		},
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id
			}
			return session
		}
	}
}

export default NextAuth(authOptions) 
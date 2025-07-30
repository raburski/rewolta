import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import SignInButton from './SignInButton'

export default async function SignInPage() {
	const session = await getServerSession(authOptions)

	if (session) {
		redirect('/')
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Sign in to your account
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Access protected content by signing in with Facebook
					</p>
				</div>
				<div className="mt-8 space-y-6">
					<SignInButton />
				</div>
			</div>
		</div>
	)
} 
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

interface GenPageProps {
	params: {
		name: string
	}
}

export default async function GenPage({ params }: GenPageProps) {
	const session = await getServerSession(authOptions)

	if (!session) {
		redirect('/api/auth/signin')
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-6">
					Protected Content for: {params.name}
				</h1>
				
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center mb-4">
						{session.user?.image && (
							<img 
								src={session.user.image} 
								alt="Profile" 
								className="w-10 h-10 rounded-full mr-3"
							/>
						)}
						<div>
							<p className="font-semibold">Welcome, {session.user?.name}!</p>
							<p className="text-sm text-gray-600">{session.user?.email}</p>
						</div>
					</div>
					
					<div className="prose max-w-none">
						<p>This is protected content that only authenticated users can see.</p>
						<p>The route parameter is: <strong>{params.name}</strong></p>
						
						<div className="mt-6 p-4 bg-gray-50 rounded-lg">
							<h3 className="text-lg font-semibold mb-2">Session Information:</h3>
							<pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
								{JSON.stringify(session, null, 2)}
							</pre>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
} 
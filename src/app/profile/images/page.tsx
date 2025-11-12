import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Layout from '@/app/components/Layout/Layout'
import PageContent from '@/app/components/PageContent/PageContent'
import AllImagesHistory from './AllImagesHistory'

export default async function AllImagesPage() {
	const session = await auth()

	if (!session) {
		redirect('/api/auth/signin')
	}

	return (
		<Layout
			title="Wszystkie wygenerowane obrazy"
			subtitle="Twoje obrazy ze wszystkich produktów"
		>
			<PageContent>
				<AllImagesHistory />
			</PageContent>
		</Layout>
	)
}



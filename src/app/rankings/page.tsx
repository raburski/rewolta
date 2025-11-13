import { Suspense } from 'react'
import Layout from '@/app/components/Layout/Layout'
import PageContent from '@/app/components/PageContent/PageContent'
import RankingsContent from '@/app/components/Rankings/RankingsContent'

export default function RankingsPage() {
	return (
		<Layout
			title="AI Generator: Rankingi"
			subtitle="Najlepiej oceniane wygenerowane budynki"
		>
			<PageContent>
				<Suspense fallback={
					<div style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: '50vh',
						fontSize: '1.1rem',
						color: '#666'
					}}>
						Ładowanie...
					</div>
				}>
					<RankingsContent />
				</Suspense>
			</PageContent>
		</Layout>
	)
}


import Layout from '@/app/components/Layout/Layout'
import PageContent from '@/app/components/PageContent/PageContent'
import BuildingComparison from '@/app/components/BuildingComparison/BuildingComparison'

export default function ComparePage() {
	return (
		<Layout
			title="Oceń budynki"
			subtitle="Porównaj i oceń wygenerowane budynki"
		>
			<PageContent>
				<BuildingComparison />
			</PageContent>
		</Layout>
	)
}


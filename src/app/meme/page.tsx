'use client'

import { useState } from "react"
import styles from "./page.module.css"
import MemeGenerator from "../components/MemeGenerator/MemeGenerator"
import Header from "@/app/components/Header/Header"
import Footer from "@/app/components/Footer/Footer"

const MARGINS = {
	bottom: 32,
	left: 10,
	right: 10,
}

const MENU_ITEMS = [
	{
		id: 'estetycki',
		title: 'Czynnik estetycki',
		description: 'Z cyklu budynek przed i po',
		overlayImageUrl: '/memes/front1.png'
	}
]

export default function MemePage() {
	const [selectedItem, setSelectedItem] = useState(MENU_ITEMS[0])

	return (
		<main className={styles.main}>
			<Header 
				title="Generator Memów"
				subtitle="Stwórz własnego rewoltowego mema"
			/>
			<div className={styles.content}>
				<div className={styles.grid}>
					{MENU_ITEMS.map(item => (
						<a
							key={item.id}
							onClick={() => setSelectedItem(item)}
							className={`${styles.card} ${selectedItem.id === item.id ? styles.selected : ''}`}
						>
							<h2>{item.title} <span>-&gt;</span></h2>
							<p>{item.description}</p>
						</a>
					))}
				</div>
				<div className={styles.generatorWrapper}>
					<MemeGenerator 
						overlayImageUrl={selectedItem.overlayImageUrl}
						topImageMargins={MARGINS}
						bottomImageMargins={MARGINS}
					/>
				</div>
			</div>
			<Footer />
		</main>
	)
}

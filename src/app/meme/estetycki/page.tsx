'use client'

import { FC } from "react"
import styles from "./page.module.css"
import MemeGenerator from "../../components/MemeGenerator/MemeGenerator"

const MARGINS = {
	bottom: 32,
	left: 10,
	right: 10,
}

const EstetyckiMemePage: FC = () => {
	return (
		<div className={styles.container}>
			{/* <h1 className={styles.title}>Estetycki</h1> */}
			{/* <p className={styles.text}>Create your aesthetic meme by adding images to both sections!</p> */}
			<div className={styles.generatorWrapper}>
				<MemeGenerator 
					overlayImageUrl="/memes/front1.png"
					topImageMargins={MARGINS}
					bottomImageMargins={MARGINS}
				/>
			</div>
		</div>
	)
}

export default EstetyckiMemePage 
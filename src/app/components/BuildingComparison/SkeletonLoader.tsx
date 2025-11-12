'use client'

import styles from './BuildingComparison.module.css'

const AVAILABLE_TAGS = [
	'piękny',
	'mroczny',
	'uroczy',
	'elegancki',
	'nowoczesny',
	'klasyczny',
	'odważny',
	'delikatny',
	'masywny',
	'lekki',
	'harmonijny',
	'kontrastowy',
	'inspirujący',
	'nudny',
	'oryginalny',
	'typowy'
]

export default function SkeletonLoader() {
	return (
		<div className={styles.comparison}>
			<div className={styles.building}>
				<div className={styles.imageContainer}>
					<div className={styles.skeletonImage}></div>
				</div>
				<div className={styles.info}>
					<div className={styles.skeletonProductName}></div>
					<div className={styles.skeletonCreator}></div>
				</div>
				<div className={styles.tagsSection}>
					<div className={styles.tagsLabel}>Tagi (opcjonalnie):</div>
					<div className={styles.tagsContainer}>
						{AVAILABLE_TAGS.map(tag => (
							<button
								key={tag}
								type="button"
								className={styles.inlineTag}
								disabled
							>
								{tag}
							</button>
						))}
					</div>
				</div>
				<button
					type="button"
					className={styles.chooseButton}
					disabled
				>
					Wybierz A
				</button>
			</div>

			<div className={styles.building}>
				<div className={styles.imageContainer}>
					<div className={styles.skeletonImage}></div>
				</div>
				<div className={styles.info}>
					<div className={styles.skeletonProductName}></div>
					<div className={styles.skeletonCreator}></div>
				</div>
				<div className={styles.tagsSection}>
					<div className={styles.tagsLabel}>Tagi (opcjonalnie):</div>
					<div className={styles.tagsContainer}>
						{AVAILABLE_TAGS.map(tag => (
							<button
								key={tag}
								type="button"
								className={styles.inlineTag}
								disabled
							>
								{tag}
							</button>
						))}
					</div>
				</div>
				<button
					type="button"
					className={styles.chooseButton}
					disabled
				>
					Wybierz B
				</button>
			</div>
		</div>
	)
}


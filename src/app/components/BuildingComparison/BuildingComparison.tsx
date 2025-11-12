'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useNextComparison } from '@/lib/hooks/useNextComparison'
import { useSubmitComparison } from '@/lib/hooks/useSubmitComparison'
import SkeletonLoader from './SkeletonLoader'
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

interface Submission {
	id: string
	imageId: string
	imageUrl: string
	productId: string
	productName: string
	userId: string
	userName: string
}

export default function BuildingComparison() {
	const router = useRouter()
	const [tagsForA, setTagsForA] = useState<string[]>([])
	const [tagsForB, setTagsForB] = useState<string[]>([])
	const [comparisonCount, setComparisonCount] = useState(0)
	
	const { comparison, isLoading, hasError, error, isNoMoreComparisons, refresh } = useNextComparison()
	const { submitComparison, isSubmitting, error: submitError } = useSubmitComparison()

	const toggleTag = (side: 'A' | 'B', tag: string) => {
		if (side === 'A') {
			setTagsForA(prev => {
				if (prev.includes(tag)) {
					return prev.filter(t => t !== tag)
				} else {
					if (prev.length >= 5) {
						return prev // Max 5 tags
					}
					return [...prev, tag]
				}
			})
		} else {
			setTagsForB(prev => {
				if (prev.includes(tag)) {
					return prev.filter(t => t !== tag)
				} else {
					if (prev.length >= 5) {
						return prev // Max 5 tags
					}
					return [...prev, tag]
				}
			})
		}
	}

	const handleChoose = useCallback(async (winnerId: string) => {
		if (!comparison || isSubmitting) return



		const result = await submitComparison({
			submissionAId: comparison.submissionA.id,
			submissionBId: comparison.submissionB.id,
			winnerId,
			tagsForA: tagsForA.length > 0 ? tagsForA : undefined,
			tagsForB: tagsForB.length > 0 ? tagsForB : undefined
		})

		// Clear tags immediately to show new pair is coming
		setTagsForA([])
		setTagsForB([])

		if (result) {
			setComparisonCount(prev => prev + 1)
			refresh()
		}
	}, [comparison, tagsForA, tagsForB, submitComparison, isSubmitting, refresh])

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (isSubmitting || !comparison) return
			
			if (e.key === 'a' || e.key === 'A') {
				handleChoose(comparison.submissionA.id)
			} else if (e.key === 'd' || e.key === 'D') {
				handleChoose(comparison.submissionB.id)
			}
		}

		window.addEventListener('keydown', handleKeyPress)
		return () => window.removeEventListener('keydown', handleKeyPress)
	}, [comparison, isSubmitting, handleChoose])

	if (isLoading) {
		return (
			<div className={styles.container}>
				<SkeletonLoader />
			</div>
		)
	}

	if (hasError) {
		return (
			<div className={styles.container}>
				<div className={styles.error}>
					<p>{error || 'Błąd podczas ładowania'}</p>
					{isNoMoreComparisons && (
						<p className={styles.emptyMessage}>
							Sprawdź ponownie później, gdy pojawią się nowe zgłoszenia!
						</p>
					)}
					<button onClick={() => router.push('/')} className={styles.backButton}>
						Powrót
					</button>
				</div>
			</div>
		)
	}

	if (!comparison) {
		return (
			<div className={styles.container}>
				<div className={styles.empty}>
					<p>Brak dostępnych porównań</p>
					<button onClick={() => router.push('/')} className={styles.backButton}>
						Powrót
					</button>
				</div>
			</div>
		)
	}

	if (isSubmitting) {
		return (
			<div className={styles.container}>
				<SkeletonLoader />
			</div>
		)
	}

	return (
		<>
			<div className={styles.container}>
				<div className={styles.comparison}>
					<div className={styles.building}>
						<div className={styles.imageContainer}>
							{comparison.submissionA.imageUrl ? (
								<img
									key={comparison.submissionA.imageUrl}
									src={comparison.submissionA.imageUrl}
									alt={comparison.submissionA.productName}
									className={styles.image}
								/>
							) : (
								<div className={styles.imagePlaceholder}>Ładowanie obrazu...</div>
							)}
						</div>
						<div className={styles.info}>
							<h3 className={styles.productName}>{comparison.submissionA.productName}</h3>
							<p className={styles.creator}>by {comparison.submissionA.userName || 'Anonymous'}</p>
						</div>
						<div className={styles.tagsSection}>
							<div className={styles.tagsLabel}>Tagi (opcjonalnie):</div>
							<div className={styles.tagsContainer}>
								{AVAILABLE_TAGS.map(tag => (
									<button
										key={tag}
										type="button"
										className={`${styles.inlineTag} ${tagsForA.includes(tag) ? styles.inlineTagSelected : ''}`}
										onClick={() => toggleTag('A', tag)}
										disabled={!tagsForA.includes(tag) && tagsForA.length >= 5}
									>
										{tag}
									</button>
								))}
							</div>
						</div>
						<button
							type="button"
							className={styles.chooseButton}
							onClick={() => handleChoose(comparison.submissionA.id)}
							disabled={isSubmitting}
						>
							Wybierz A
						</button>
					</div>

					<div className={styles.building}>
						<div className={styles.imageContainer}>
							{comparison.submissionB.imageUrl ? (
								<img
									key={comparison.submissionB.imageUrl}
									src={comparison.submissionB.imageUrl}
									alt={comparison.submissionB.productName}
									className={styles.image}
								/>
							) : (
								<div className={styles.imagePlaceholder}>Ładowanie obrazu...</div>
							)}
						</div>
						<div className={styles.info}>
							<h3 className={styles.productName}>{comparison.submissionB.productName}</h3>
							<p className={styles.creator}>by {comparison.submissionB.userName || 'Anonymous'}</p>
						</div>
						<div className={styles.tagsSection}>
							<div className={styles.tagsLabel}>Tagi (opcjonalnie):</div>
							<div className={styles.tagsContainer}>
								{AVAILABLE_TAGS.map(tag => (
									<button
										key={tag}
										type="button"
										className={`${styles.inlineTag} ${tagsForB.includes(tag) ? styles.inlineTagSelected : ''}`}
										onClick={() => toggleTag('B', tag)}
										disabled={!tagsForB.includes(tag) && tagsForB.length >= 5}
									>
										{tag}
									</button>
								))}
							</div>
						</div>
						<button
							type="button"
							className={styles.chooseButton}
							onClick={() => handleChoose(comparison.submissionB.id)}
							disabled={isSubmitting}
						>
							Wybierz B
						</button>
					</div>
				</div>

				{submitError && (
					<div className={styles.errorMessage}>
						Błąd: {submitError}
					</div>
				)}

				<div className={styles.hint}>
					Użyj klawiszy <kbd>A</kbd> i <kbd>D</kbd> aby wybrać
				</div>
			</div>
		</>
	)
}


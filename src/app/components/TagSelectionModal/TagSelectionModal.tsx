'use client'

import { useState } from 'react'
import Modal from '../Modal/Modal'
import styles from './TagSelectionModal.module.css'

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

interface TagSelectionModalProps {
	buildingName: string
	onClose: () => void
	onConfirm: (selectedTags: string[]) => void
	initialTags?: string[]
}

export default function TagSelectionModal({
	buildingName,
	onClose,
	onConfirm,
	initialTags = []
}: TagSelectionModalProps) {
	const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)

	const toggleTag = (tag: string) => {
		setSelectedTags(prev => {
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

	const handleConfirm = () => {
		onConfirm(selectedTags)
		onClose()
	}

	return (
		<Modal
			title={`Dodaj tagi do ${buildingName}`}
			subtitle="Wybierz 1-5 tagów (opcjonalnie)"
			onClose={onClose}
		>
			<div className={styles.content}>
				<div className={styles.tagGrid}>
					{AVAILABLE_TAGS.map(tag => (
						<button
							key={tag}
							type="button"
							className={`${styles.tagButton} ${selectedTags.includes(tag) ? styles.tagButtonSelected : ''}`}
							onClick={() => toggleTag(tag)}
							disabled={!selectedTags.includes(tag) && selectedTags.length >= 5}
						>
							{tag}
						</button>
					))}
				</div>
				<div className={styles.footer}>
					<p className={styles.selectedCount}>
						Wybrano: {selectedTags.length} {selectedTags.length === 1 ? 'tag' : 'tagów'}
					</p>
					<div className={styles.actions}>
						<button
							type="button"
							className={styles.cancelButton}
							onClick={onClose}
						>
							Anuluj
						</button>
						<button
							type="button"
							className={styles.confirmButton}
							onClick={handleConfirm}
						>
							Gotowe
						</button>
					</div>
				</div>
			</div>
		</Modal>
	)
}


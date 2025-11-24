'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { useRankings } from '@/lib/hooks/useRankings'
import RankingTypeFilter from '@/app/components/RankingTypeFilter/RankingTypeFilter'
import FullscreenImage from '@/app/components/FullscreenImage/FullscreenImage'
import styles from './RankingsContent.module.css'

const TIME_RANGES = [
	{ value: 'alltime', label: 'Wszystkie' },
	{ value: 'daily', label: 'Dzisiaj' },
	{ value: 'weekly', label: 'Tydzień' },
	{ value: 'monthly', label: 'Miesiąc' }
]

export default function RankingsContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()
	const limit = 20
	const [fullscreenImage, setFullscreenImage] = useState<{ url: string; alt: string } | null>(null)

	const selectedProductId = searchParams.get('product')
	const timeRangeParam = searchParams.get('period') || 'alltime'
	const timeRange = (['daily', 'weekly', 'monthly', 'alltime'].includes(timeRangeParam) 
		? timeRangeParam 
		: 'alltime') as 'daily' | 'weekly' | 'monthly' | 'alltime'
	
	const { rankings, total, hasMore, isLoading, isLoadingMore, hasError, error, loadMore, resetPagination } = useRankings({
		type: selectedProductId ? 'product' : 'global',
		productId: selectedProductId || undefined,
		timeRange,
		limit
	})

	const updateUrl = (productId: string | null, newTimeRange: string) => {
		const params = new URLSearchParams(searchParams.toString())
		
		if (productId) {
			params.set('product', productId)
		} else {
			params.delete('product')
		}
		
		if (newTimeRange && newTimeRange !== 'alltime') {
			params.set('period', newTimeRange)
		} else {
			params.delete('period')
		}
		
		const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
		router.push(newUrl)
	}

	const handleProductChange = (productId: string | null) => {
		updateUrl(productId, timeRange)
		resetPagination()
	}

	const handleTimeRangeChange = (newTimeRange: 'daily' | 'weekly' | 'monthly' | 'alltime') => {
		updateUrl(selectedProductId, newTimeRange)
		resetPagination()
	}

	const handleLoadMore = () => {
		if (hasMore && !isLoadingMore) {
			loadMore()
		}
	}

	if (isLoading && rankings.length === 0) {
		return (
			<div className={styles.container}>
				<div className={styles.filters}>
					<RankingTypeFilter
						selectedProductId={selectedProductId}
						onProductChange={handleProductChange}
					/>
					<div className={`${styles.filterGroup} ${styles.timeRangeGroup}`}>
						<label>Okres:</label>
						<select
							value={timeRange}
							onChange={(e) => handleTimeRangeChange(e.target.value as any)}
							className={styles.select}
						>
							{TIME_RANGES.map(tr => (
								<option key={tr.value} value={tr.value}>
									{tr.label}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className={styles.podium}>
					<div className={styles.skeletonFirstPlace}>
						<div className={styles.skeletonImageContainer}>
							<div className={styles.skeletonImage}></div>
						</div>
						<div className={styles.skeletonInfo}>
							<div className={styles.skeletonProductName}></div>
							<div className={styles.skeletonCreator}></div>
							<div className={styles.skeletonStats}>
								<div className={styles.skeletonStat}></div>
								<div className={styles.skeletonStat}></div>
								<div className={styles.skeletonStat}></div>
								<div className={styles.skeletonStat}></div>
							</div>
						</div>
					</div>
					<div className={styles.secondThirdPlace}>
						<div className={styles.skeletonSecondPlace}>
							<div className={styles.skeletonImageContainer}>
								<div className={styles.skeletonImage}></div>
							</div>
							<div className={styles.skeletonInfo}>
								<div className={styles.skeletonProductName}></div>
								<div className={styles.skeletonCreator}></div>
								<div className={styles.skeletonStats}>
									<div className={styles.skeletonStat}></div>
									<div className={styles.skeletonStat}></div>
								</div>
							</div>
						</div>
						<div className={styles.skeletonThirdPlace}>
							<div className={styles.skeletonImageContainer}>
								<div className={styles.skeletonImage}></div>
							</div>
							<div className={styles.skeletonInfo}>
								<div className={styles.skeletonProductName}></div>
								<div className={styles.skeletonCreator}></div>
								<div className={styles.skeletonStats}>
									<div className={styles.skeletonStat}></div>
									<div className={styles.skeletonStat}></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (hasError) {
		return (
			<div className={styles.container}>
				<div className={styles.error}>
					<p>{error || 'Błąd podczas ładowania rankingu'}</p>
				</div>
			</div>
		)
	}

	return (
		<div className={styles.container}>
			<div className={styles.filters}>
				<RankingTypeFilter
					selectedProductId={selectedProductId}
					onProductChange={handleProductChange}
				/>
				<div className={`${styles.filterGroup} ${styles.timeRangeGroup}`}>
					<label>Okres:</label>
					<select
						value={timeRange}
						onChange={(e) => handleTimeRangeChange(e.target.value as any)}
						className={styles.select}
					>
						{TIME_RANGES.map(tr => (
							<option key={tr.value} value={tr.value}>
								{tr.label}
							</option>
						))}
					</select>
				</div>
			</div>

			{rankings.length === 0 ? (
				<div className={styles.empty}>
					<p>Brak wyników dla wybranych filtrów</p>
				</div>
			) : (
				<>
					{rankings.length > 0 && (
						<div className={styles.podium}>
							{rankings[0] && (
								<div className={styles.firstPlace}>
									<div 
										className={styles.imageContainer}
										onClick={() => {
											if (rankings[0].submission.imageUrl) {
												setFullscreenImage({
													url: rankings[0].submission.imageUrl,
													alt: rankings[0].submission.productName
												})
											}
										}}
									>
										<div className={styles.rankBadge}>🥇</div>
										{rankings[0].submission.imageUrl ? (
											<img
												src={rankings[0].submission.imageUrl}
												alt={rankings[0].submission.productName}
												className={styles.image}
												style={{ cursor: 'pointer' }}
											/>
										) : (
											<div className={styles.imagePlaceholder}>Brak obrazu</div>
										)}
									</div>
									<div className={styles.info}>
										<div className={styles.nameRow}>
											<div>
												<h3 className={styles.productName}>{rankings[0].submission.productName}</h3>
												<p className={styles.creator}>by {rankings[0].submission.userName || 'Anonymous'}</p>
											</div>
											<Link
												href={`/images/${rankings[0].submission.imageId}`}
												target="_blank"
												rel="noopener noreferrer"
												className={styles.externalLink}
												onClick={(e) => e.stopPropagation()}
											>
												<FaExternalLinkAlt />
											</Link>
										</div>
										<div className={styles.statsSection}>
											<div className={styles.eloStat}>
												<span className={styles.eloLabel}>ELO</span>
												<span className={styles.eloValue}>{rankings[0].submission.eloRating}</span>
											</div>
											<div className={styles.additionalStats}>
												<span className={styles.additionalStatItem}>
													<span className={styles.additionalStatValue}>{rankings[0].submission.wins}</span>
													<span className={styles.additionalStatLabel}>W</span>
													<span className={styles.tooltip}>Wygrane</span>
												</span>
												<span className={styles.additionalStatItem}>
													<span className={styles.additionalStatValue}>{rankings[0].submission.losses}</span>
													<span className={styles.additionalStatLabel}>L</span>
													<span className={styles.tooltip}>Przegrane</span>
												</span>
												<span className={styles.additionalStatItem}>
													<span className={styles.additionalStatValue}>{rankings[0].submission.totalComparisons}</span>
													<span className={styles.additionalStatLabel}>P</span>
													<span className={styles.tooltip}>Porównania</span>
												</span>
											</div>
										</div>
										{rankings[0].submission.topTags.length > 0 && (
											<div className={styles.tags}>
												{rankings[0].submission.topTags.map((tagItem) => (
													<span key={tagItem.tag} className={styles.tag}>
														{tagItem.tag} ({tagItem.count})
													</span>
												))}
											</div>
										)}
									</div>
								</div>
							)}
							<div className={styles.secondThirdPlace}>
								{rankings[1] && (
									<div className={styles.secondPlace}>
										<div 
											className={styles.imageContainer}
											onClick={() => {
												if (rankings[1].submission.imageUrl) {
													setFullscreenImage({
														url: rankings[1].submission.imageUrl,
														alt: rankings[1].submission.productName
													})
												}
											}}
										>
											<div className={styles.rankBadge}>🥈</div>
											{rankings[1].submission.imageUrl ? (
												<img
													src={rankings[1].submission.imageUrl}
													alt={rankings[1].submission.productName}
													className={styles.image}
													style={{ cursor: 'pointer' }}
												/>
											) : (
												<div className={styles.imagePlaceholder}>Brak obrazu</div>
											)}
										</div>
										<div className={styles.info}>
											<div className={styles.nameRow}>
												<div>
													<h3 className={styles.productName}>{rankings[1].submission.productName}</h3>
													<p className={styles.creator}>by {rankings[1].submission.userName || 'Anonymous'}</p>
												</div>
												<Link
													href={`/images/${rankings[1].submission.imageId}`}
													target="_blank"
													rel="noopener noreferrer"
													className={styles.externalLink}
													onClick={(e) => e.stopPropagation()}
												>
													<FaExternalLinkAlt />
												</Link>
											</div>
											<div className={styles.statsSection}>
												<div className={styles.eloStat}>
													<span className={styles.eloLabel}>ELO</span>
													<span className={styles.eloValue}>{rankings[1].submission.eloRating}</span>
												</div>
												<div className={styles.additionalStats}>
													<span className={styles.additionalStatItem}>
														<span className={styles.additionalStatValue}>{rankings[1].submission.wins}</span>
														<span className={styles.additionalStatLabel}>W</span>
														<span className={styles.tooltip}>Wygrane</span>
													</span>
													<span className={styles.additionalStatItem}>
														<span className={styles.additionalStatValue}>{rankings[1].submission.losses}</span>
														<span className={styles.additionalStatLabel}>L</span>
														<span className={styles.tooltip}>Przegrane</span>
													</span>
													<span className={styles.additionalStatItem}>
														<span className={styles.additionalStatValue}>{rankings[1].submission.totalComparisons}</span>
														<span className={styles.additionalStatLabel}>P</span>
														<span className={styles.tooltip}>Porównania</span>
													</span>
												</div>
											</div>
										</div>
									</div>
								)}
								{rankings[2] && (
									<div className={styles.thirdPlace}>
										<div 
											className={styles.imageContainer}
											onClick={() => {
												if (rankings[2].submission.imageUrl) {
													setFullscreenImage({
														url: rankings[2].submission.imageUrl,
														alt: rankings[2].submission.productName
													})
												}
											}}
										>
											<div className={styles.rankBadge}>🥉</div>
											{rankings[2].submission.imageUrl ? (
												<img
													src={rankings[2].submission.imageUrl}
													alt={rankings[2].submission.productName}
													className={styles.image}
													style={{ cursor: 'pointer' }}
												/>
											) : (
												<div className={styles.imagePlaceholder}>Brak obrazu</div>
											)}
										</div>
										<div className={styles.info}>
											<div className={styles.nameRow}>
												<div>
													<h3 className={styles.productName}>{rankings[2].submission.productName}</h3>
													<p className={styles.creator}>by {rankings[2].submission.userName || 'Anonymous'}</p>
												</div>
												<Link
													href={`/images/${rankings[2].submission.imageId}`}
													target="_blank"
													rel="noopener noreferrer"
													className={styles.externalLink}
													onClick={(e) => e.stopPropagation()}
												>
													<FaExternalLinkAlt />
												</Link>
											</div>
											<div className={styles.statsSection}>
												<div className={styles.eloStat}>
													<span className={styles.eloLabel}>ELO</span>
													<span className={styles.eloValue}>{rankings[2].submission.eloRating}</span>
												</div>
												<div className={styles.additionalStats}>
													<span className={styles.additionalStatItem}>
														<span className={styles.additionalStatValue}>{rankings[2].submission.wins}</span>
														<span className={styles.additionalStatLabel}>W</span>
														<span className={styles.tooltip}>Wygrane</span>
													</span>
													<span className={styles.additionalStatItem}>
														<span className={styles.additionalStatValue}>{rankings[2].submission.losses}</span>
														<span className={styles.additionalStatLabel}>L</span>
														<span className={styles.tooltip}>Przegrane</span>
													</span>
													<span className={styles.additionalStatItem}>
														<span className={styles.additionalStatValue}>{rankings[2].submission.totalComparisons}</span>
														<span className={styles.additionalStatLabel}>P</span>
														<span className={styles.tooltip}>Porównania</span>
													</span>
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
					
					{fullscreenImage && (
						<FullscreenImage
							imageUrl={fullscreenImage.url}
							alt={fullscreenImage.alt}
							isOpen={!!fullscreenImage}
							onClose={() => setFullscreenImage(null)}
						/>
					)}

					{rankings.length > 3 && (
						<>
							<div className={styles.separator}></div>
							<div className={styles.rankingsGrid}>
								{rankings.slice(3).map((ranking, index) => {
									const rank = ranking.rank || index + 4
									return (
									<div key={ranking.submission.id} className={styles.rankingCard}>
										<div 
											className={styles.imageContainer}
											onClick={() => {
												if (ranking.submission.imageUrl) {
													setFullscreenImage({
														url: ranking.submission.imageUrl,
														alt: ranking.submission.productName
													})
												}
											}}
										>
											<div className={styles.rankBadge}>#{rank}</div>
											{ranking.submission.imageUrl ? (
												<img
													src={ranking.submission.imageUrl}
													alt={ranking.submission.productName}
													className={styles.image}
													style={{ cursor: 'pointer' }}
												/>
											) : (
												<div className={styles.imagePlaceholder}>Brak obrazu</div>
											)}
										</div>
										<div className={styles.info}>
											<div className={styles.nameRow}>
												<div>
													<h3 className={styles.productName}>{ranking.submission.productName}</h3>
													<p className={styles.creator}>by {ranking.submission.userName || 'Anonymous'}</p>
												</div>
												<Link
													href={`/images/${ranking.submission.imageId}`}
													target="_blank"
													rel="noopener noreferrer"
													className={styles.externalLink}
													onClick={(e) => e.stopPropagation()}
												>
													<FaExternalLinkAlt />
												</Link>
											</div>
											<div className={styles.statsSection}>
												<div className={styles.eloStat}>
													<span className={styles.eloLabel}>ELO</span>
													<span className={styles.eloValue}>{ranking.submission.eloRating}</span>
												</div>
												<div className={styles.additionalStats}>
													<span className={styles.additionalStatItem}>
														<span className={styles.additionalStatValue}>{ranking.submission.wins}</span>
														<span className={styles.additionalStatLabel}>W</span>
														<span className={styles.tooltip}>Wygrane</span>
													</span>
													<span className={styles.additionalStatItem}>
														<span className={styles.additionalStatValue}>{ranking.submission.losses}</span>
														<span className={styles.additionalStatLabel}>L</span>
														<span className={styles.tooltip}>Przegrane</span>
													</span>
													<span className={styles.additionalStatItem}>
														<span className={styles.additionalStatValue}>{ranking.submission.totalComparisons}</span>
														<span className={styles.additionalStatLabel}>P</span>
														<span className={styles.tooltip}>Porównania</span>
													</span>
												</div>
											</div>
											{ranking.submission.topTags.length > 0 && (
												<div className={styles.tags}>
													{ranking.submission.topTags.map((tagItem) => (
														<span key={tagItem.tag} className={styles.tag}>
															{tagItem.tag} ({tagItem.count})
														</span>
													))}
												</div>
											)}
										</div>
									</div>
									)
								})}
							</div>
						</>
					)}

					{hasMore && (
						<div className={styles.loadMoreContainer}>
							<button
								onClick={handleLoadMore}
								disabled={isLoadingMore}
								className={styles.loadMoreButton}
							>
								{isLoadingMore ? 'Ładowanie...' : 'Załaduj więcej'}
							</button>
						</div>
					)}
				</>
			)}
		</div>
	)
}


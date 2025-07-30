'use client'

import { useEffect, useRef } from 'react'
import styles from './LoadingAnimation.module.css'

interface LoadingAnimationProps {
	isLoading: boolean
	size?: 'small' | 'medium' | 'large'
}

interface Particle {
	x: number
	y: number
	vx: number
	vy: number
	size: number
	color: string
	life: number
	maxLife: number
}

export default function LoadingAnimation({ isLoading, size = 'medium' }: LoadingAnimationProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animationRef = useRef<number>()
	const particlesRef = useRef<Particle[]>([])
	const spawnTimerRef = useRef<number>()
	const targetParticleCountRef = useRef<number>(0)

	useEffect(() => {
		if (!isLoading || !canvasRef.current) return

		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		// Set canvas size
		const rect = canvas.getBoundingClientRect()
		canvas.width = rect.width * window.devicePixelRatio
		canvas.height = rect.height * window.devicePixelRatio
		ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

		// Colors for particles
		const colors = [
			'#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
			'#84cc16', '#f97316', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'
		]

		// Calculate target particle count
		targetParticleCountRef.current = Math.floor((rect.width * rect.height) / 1000) + 30

		// Initialize particles array (empty to start)
		particlesRef.current = []

		// Progressive spawning function
		const spawnParticle = () => {
			if (particlesRef.current.length >= targetParticleCountRef.current) return

			const centerX = rect.width / 2
			const centerY = rect.height / 2
			const maxRadius = Math.max(rect.width, rect.height) * 0.4

			let x, y
			const spawnType = Math.random()
			
			if (spawnType < 0.3) {
				// Spiral pattern
				const angle = (particlesRef.current.length / targetParticleCountRef.current) * Math.PI * 6
				const distance = (particlesRef.current.length / targetParticleCountRef.current) * maxRadius
				x = centerX + Math.cos(angle) * distance
				y = centerY + Math.sin(angle) * distance
			} else if (spawnType < 0.6) {
				// Random distribution
				x = Math.random() * rect.width
				y = Math.random() * rect.height
			} else {
				// Concentric circles
				const angle = Math.random() * Math.PI * 2
				const distance = Math.random() * maxRadius
				x = centerX + Math.cos(angle) * distance
				y = centerY + Math.sin(angle) * distance
			}

			particlesRef.current.push({
				x,
				y,
				vx: (Math.random() - 0.5) * 3,
				vy: (Math.random() - 0.5) * 3,
				size: Math.random() * 5 + 2,
				color: colors[Math.floor(Math.random() * colors.length)],
				life: Math.random() * 100,
				maxLife: 100 + Math.random() * 100
			})
		}

		// Start progressive spawning
		const startProgressiveSpawning = () => {
			// Start with zero particles and build up gradually
			spawnTimerRef.current = window.setInterval(() => {
				if (particlesRef.current.length < targetParticleCountRef.current) {
					spawnParticle()
				} else {
					// Stop spawning when we reach target count
					if (spawnTimerRef.current) {
						clearInterval(spawnTimerRef.current)
						spawnTimerRef.current = undefined
					}
				}
			}, 120) // Spawn a new particle every 150ms for slower, more gradual build-up
		}

		// Update and draw particles
		const animate = () => {
			ctx.clearRect(0, 0, rect.width, rect.height)

			const centerX = rect.width / 2
			const centerY = rect.height / 2
			const maxRadius = Math.max(rect.width, rect.height) * 0.4

			particlesRef.current.forEach((particle, index) => {
				// Update position
				particle.x += particle.vx
				particle.y += particle.vy

				// Add some organic movement
				particle.vx += (Math.random() - 0.5) * 0.15
				particle.vy += (Math.random() - 0.5) * 0.15

				// Multiple attraction points for more complex movement
				const attractionPoints = [
					{ x: centerX, y: centerY, strength: 0.02 },
					{ x: rect.width * 0.25, y: rect.height * 0.25, strength: 0.01 },
					{ x: rect.width * 0.75, y: rect.height * 0.75, strength: 0.01 },
					{ x: rect.width * 0.25, y: rect.height * 0.75, strength: 0.01 },
					{ x: rect.width * 0.75, y: rect.height * 0.25, strength: 0.01 }
				]

				attractionPoints.forEach((point, pointIndex) => {
					const dx = point.x - particle.x
					const dy = point.y - particle.y
					const distance = Math.sqrt(dx * dx + dy * dy)
					if (distance > 0) {
						const attraction = Math.sin(Date.now() * 0.001 + index * 0.1 + pointIndex) * point.strength
						particle.vx += (dx / distance) * attraction
						particle.vy += (dy / distance) * attraction
					}
				})

				// Dampen velocity
				particle.vx *= 0.98
				particle.vy *= 0.98

				// Wrap around edges
				if (particle.x < 0) particle.x = rect.width
				if (particle.x > rect.width) particle.x = 0
				if (particle.y < 0) particle.y = rect.height
				if (particle.y > rect.height) particle.y = 0

				// Update life
				particle.life += 1
				if (particle.life > particle.maxLife) {
					particle.life = 0
					// Respawn with better distribution across the canvas
					const respawnType = Math.random()
					
					if (respawnType < 0.4) {
						// Respawn at random edge (40% chance)
						const edge = Math.floor(Math.random() * 4)
						switch (edge) {
							case 0: // top
								particle.x = Math.random() * rect.width
								particle.y = -10
								break
							case 1: // right
								particle.x = rect.width + 10
								particle.y = Math.random() * rect.height
								break
							case 2: // bottom
								particle.x = Math.random() * rect.width
								particle.y = rect.height + 10
								break
							case 3: // left
								particle.x = -10
								particle.y = Math.random() * rect.height
								break
						}
					} else if (respawnType < 0.7) {
						// Respawn in middle ring area (30% chance) - not too close to center
						const minRadius = Math.min(rect.width, rect.height) * 0.15
						const maxRadius = Math.min(rect.width, rect.height) * 0.35
						const angle = Math.random() * Math.PI * 2
						const distance = minRadius + Math.random() * (maxRadius - minRadius)
						particle.x = centerX + Math.cos(angle) * distance
						particle.y = centerY + Math.sin(angle) * distance
					} else {
						// Respawn randomly across the entire canvas (30% chance)
						particle.x = Math.random() * rect.width
						particle.y = Math.random() * rect.height
					}
					
					particle.color = colors[Math.floor(Math.random() * colors.length)]
				}

				// Draw particle
				const alpha = Math.sin((particle.life / particle.maxLife) * Math.PI) * 0.8 + 0.2
				ctx.save()
				ctx.globalAlpha = alpha
				ctx.fillStyle = particle.color
				ctx.beginPath()
				ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
				ctx.fill()

				// Add glow effect
				ctx.shadowColor = particle.color
				ctx.shadowBlur = particle.size * 2
				ctx.fill()
				ctx.restore()

				// Draw connections between nearby particles
				particlesRef.current.forEach((otherParticle, otherIndex) => {
					if (index === otherIndex) return
					
					const dx = particle.x - otherParticle.x
					const dy = particle.y - otherParticle.y
					const distance = Math.sqrt(dx * dx + dy * dy)
					
					if (distance < 80) {
						const opacity = (80 - distance) / 80 * 0.4
						ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
						ctx.lineWidth = 1
						ctx.beginPath()
						ctx.moveTo(particle.x, particle.y)
						ctx.lineTo(otherParticle.x, otherParticle.y)
						ctx.stroke()
					}
				})
			})

			animationRef.current = requestAnimationFrame(animate)
		}

		startProgressiveSpawning()
		animate()

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
			if (spawnTimerRef.current) {
				clearInterval(spawnTimerRef.current)
			}
		}
	}, [isLoading, size])

	if (!isLoading) return null

	return (
		<div className={`${styles.loadingAnimation} ${styles[size]}`}>
			<canvas ref={canvasRef} className={styles.canvas} />
		</div>
	)
} 
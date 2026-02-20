import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

const basePrisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
	})

const prismaIdleDisconnectMs = Number(process.env.PRISMA_IDLE_DISCONNECT_MS || '0')
let activeQueryCount = 0
let idleDisconnectTimer: NodeJS.Timeout | undefined

const clearIdleDisconnectTimer = () => {
	if (!idleDisconnectTimer) return
	clearTimeout(idleDisconnectTimer)
	idleDisconnectTimer = undefined
}

const scheduleIdleDisconnect = () => {
	if (!Number.isFinite(prismaIdleDisconnectMs) || prismaIdleDisconnectMs <= 0) return

	clearIdleDisconnectTimer()

	idleDisconnectTimer = setTimeout(async () => {
		if (activeQueryCount > 0) return

		try {
			await basePrisma.$disconnect()
		} catch (error) {
			console.error('Error disconnecting Prisma client:', error)
		}
	}, prismaIdleDisconnectMs)

	idleDisconnectTimer.unref?.()
}

export const prisma = basePrisma.$extends({
	query: {
		$allModels: {
			async $allOperations({ args, query }) {
				activeQueryCount += 1
				clearIdleDisconnectTimer()

				try {
					return await query(args)
				} finally {
					activeQueryCount = Math.max(0, activeQueryCount - 1)
					if (activeQueryCount === 0) {
						scheduleIdleDisconnect()
					}
				}
			},
		},
	},
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma

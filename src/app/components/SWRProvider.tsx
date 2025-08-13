'use client'

import { SWRConfig } from 'swr'
import { fetcher } from '@/lib/fetcher'

interface SWRProviderProps {
	children: React.ReactNode
}

export default function SWRProvider({ children }: SWRProviderProps) {
	return (
		<SWRConfig
			value={{
				fetcher,
				revalidateOnFocus: false,
				revalidateOnReconnect: true,
				errorRetryCount: 3,
				errorRetryInterval: 1000,
				dedupingInterval: 2000
			}}
		>
			{children}
		</SWRConfig>
	)
} 
'use client'

import type { ReactNode } from 'react'
import pageContentStyles from './PageContent.module.css'

interface PageContentProps {
	children: ReactNode
	className?: string
}

export default function PageContent({ children, className }: PageContentProps) {
	const contentClassName = className ? `${pageContentStyles.wrapper} ${className}` : pageContentStyles.wrapper

	return (
		<div className={contentClassName}>
			{children}
		</div>
	)
}


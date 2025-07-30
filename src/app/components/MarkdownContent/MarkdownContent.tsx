import styles from './MarkdownContent.module.css'

interface MarkdownContentProps {
	content: string
	className?: string
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
	return (
		<div 
			className={`${styles.markdownContent} ${className || ''}`}
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	)
} 
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const faqDirectory = path.join(process.cwd(), 'src/content/faq')

export interface FaqData {
	id: string
	title: string
	order: number
	category: string
	image?: string
	content?: string
}

export function getAllFaqIds() {
	const fileNames = fs.readdirSync(faqDirectory)
	return fileNames.map((fileName) => {
		return {
			params: {
				slug: fileName.replace(/\.md$/, '')
			}
		}
	})
}

export function getFaqData(slug: string): FaqData {
	const fullPath = path.join(faqDirectory, `${slug}.md`)
	const fileContents = fs.readFileSync(fullPath, 'utf8')

	const matterResult = matter(fileContents)

	return {
		id: slug,
		title: matterResult.data.title,
		order: matterResult.data.order || 999,
		category: matterResult.data.category || 'general',
		image: matterResult.data.image,
		content: matterResult.content
	}
}

export function getAllFaqs(): FaqData[] {
	const fileNames = fs.readdirSync(faqDirectory)
	const allFaqData = fileNames.map((fileName) => {
		const slug = fileName.replace(/\.md$/, '')
		return getFaqData(slug)
	})

	return allFaqData.sort((a, b) => a.order - b.order)
}

export function getFaqsByCategory(): Record<string, FaqData[]> {
	const allFaqs = getAllFaqs()
	const grouped = allFaqs.reduce((acc, faq) => {
		if (!acc[faq.category]) {
			acc[faq.category] = []
		}
		acc[faq.category].push(faq)
		return acc
	}, {} as Record<string, FaqData[]>)
	
	return grouped
}

export async function getFaqContent(slug: string): Promise<string> {
	const fullPath = path.join(faqDirectory, `${slug}.md`)
	const fileContents = fs.readFileSync(fullPath, 'utf8')

	const matterResult = matter(fileContents)

	const processedContent = await remark()
		.use(html)
		.process(matterResult.content)
	const contentHtml = processedContent.toString()

	return contentHtml
} 
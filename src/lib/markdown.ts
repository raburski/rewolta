import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const contestsDirectory = path.join(process.cwd(), 'src/content/contests')

export interface ContestData {
	id: string
	title: string
	description: string
	startDate: string
	endDate: string
	status: 'active' | 'past' | 'upcoming'
	facebookPost?: string
	email?: string
	emailSubject?: string
	image?: string
	hidden?: boolean
	content?: string
}

export function getAllContestIds() {
	const fileNames = fs.readdirSync(contestsDirectory)
	return fileNames.map((fileName) => {
		return {
			params: {
				name: fileName.replace(/\.md$/, '')
			}
		}
	})
}

export function getContestData(name: string): ContestData {
	const fullPath = path.join(contestsDirectory, `${name}.md`)
	const fileContents = fs.readFileSync(fullPath, 'utf8')

	const matterResult = matter(fileContents)

	return {
		id: name,
		title: matterResult.data.title,
		description: matterResult.data.description,
		startDate: matterResult.data.startDate,
		endDate: matterResult.data.endDate,
		status: matterResult.data.status,
		facebookPost: matterResult.data.facebookPost,
		email: matterResult.data.email,
		emailSubject: matterResult.data.emailSubject,
		image: matterResult.data.image,
		hidden: matterResult.data.hidden || false,
		content: matterResult.content
	}
}

export function getAllContests(): ContestData[] {
	const fileNames = fs.readdirSync(contestsDirectory)
	const allContestsData = fileNames.map((fileName) => {
		const name = fileName.replace(/\.md$/, '')
		return getContestData(name)
	})

	return allContestsData
		.filter(contest => !contest.hidden)
		.sort((a, b) => (a.startDate < b.startDate ? 1 : -1))
}

export async function getContestContent(name: string): Promise<string> {
	const fullPath = path.join(contestsDirectory, `${name}.md`)
	const fileContents = fs.readFileSync(fullPath, 'utf8')

	const matterResult = matter(fileContents)

	const processedContent = await remark()
		.use(html)
		.process(matterResult.content)
	const contentHtml = processedContent.toString()

	return contentHtml
} 
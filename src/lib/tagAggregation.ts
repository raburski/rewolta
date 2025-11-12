import { prisma } from './prisma'

export async function updateTagCounts(
	submissionId: string,
	tags: string[]
): Promise<void> {
	if (tags.length === 0) return
	
	for (const tag of tags) {
		const normalizedTag = tag.toLowerCase().trim()
		if (!normalizedTag) continue
		
		await prisma.submissionTag.upsert({
			where: {
				submissionId_tag: {
					submissionId,
					tag: normalizedTag
				}
			},
			update: {
				count: { increment: 1 }
			},
			create: {
				submissionId,
				tag: normalizedTag,
				count: 1
			}
		})
	}
}


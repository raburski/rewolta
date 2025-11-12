export function getInitialSubmissionStatus(): 'PENDING' | 'PUBLISHED' {
	// Phase 1: Always auto-publish
	return 'PUBLISHED'
	
	// Future: Check moderation setting
	// const requireModeration = process.env.SUBMISSIONS_REQUIRE_MODERATION === 'true'
	// return requireModeration ? 'PENDING' : 'PUBLISHED'
}


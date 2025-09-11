/**
 * Ensures a URL has the https:// prefix if it doesn't already have a protocol
 * @param url - The URL to normalize
 * @returns The URL with https:// prefix if needed
 */
export function ensureHttpsUrl(url: string): string {
	if (!url) {
		return url
	}
	
	// If URL already has a protocol, return as is
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url
	}
	
	// Add https:// prefix
	return `https://${url}`
}

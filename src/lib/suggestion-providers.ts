export type BuiltInSuggestionEngine = "google" | "bing" | "duckduckgo" | "kagi";

const BUILT_IN_SUGGESTION_HOSTS = new Set([
	"www.google.com",
	"api.bing.com",
	"duckduckgo.com",
	"kagi.com",
	"kagisuggest.com",
]);

export function getBuiltInSuggestionUrl(
	engine: string,
	query: string,
): string | null {
	const encodedQuery = encodeURIComponent(query);

	switch (engine) {
		case "google":
			return `https://www.google.com/complete/search?client=chrome&q=${encodedQuery}`;
		case "bing":
			return `https://api.bing.com/osjson.aspx?query=${encodedQuery}`;
		case "duckduckgo":
			return `https://duckduckgo.com/ac/?q=${encodedQuery}&type=list`;
		case "kagi":
			return `https://kagi.com/api/autosuggest?q=${encodedQuery}`;
		default:
			return null;
	}
}

/** Only targets owned by the built-in providers may be fetched by the Worker. */
export function isAllowedSuggestionTarget(target: string): boolean {
	try {
		const url = new URL(target);
		return (
			url.protocol === "https:" &&
			url.username === "" &&
			url.password === "" &&
			(url.port === "" || url.port === "443") &&
			BUILT_IN_SUGGESTION_HOSTS.has(url.hostname)
		);
	} catch {
		return false;
	}
}

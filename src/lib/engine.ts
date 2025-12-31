import { type AppConfig, db } from "./db";

export interface RedirectResult {
	url: string;
	isCustom?: boolean;
}

const DEFAULT_CONFIG: AppConfig = {
	selectedEngine: "google",
	customUrl: "https://www.bing.com/search?go=Search&q=%s&qs=c",
	selectedSymbol: "!",
	forceBangsFirst: false,
	useStoreBangs: true,
};

async function getConfig(): Promise<AppConfig> {
	const config = await db.configs.toCollection().first();
	return config || DEFAULT_CONFIG;
}

function getEngineUrl(
	engine: string,
	customUrl: string,
	query: string,
): string {
	let baseUrl = "";
	switch (engine) {
		case "google":
			baseUrl = "https://www.google.com/search?q=%s";
			break;
		case "bing":
			baseUrl = "https://www.bing.com/search?q=%s";
			break;
		case "duckduckgo":
			baseUrl = "https://duckduckgo.com/?q=%s";
			break;
		case "custom":
			baseUrl = customUrl;
			break;
		default:
			baseUrl = "https://www.google.com/search?q=%s";
	}
	return baseUrl.replace("%s", encodeURIComponent(query));
}

/**
 * Detects the bang and query part from input.
 */
export async function parseInput(input: string) {
	const trimmedInput = input.trim();
	const config = await getConfig();
	const symbol = config.selectedSymbol;

	// Check if the query contains the symbol
	const hasSymbol = trimmedInput.includes(symbol);

	if (!hasSymbol) {
		return { trigger: null, query: trimmedInput, config };
	}

	const parts = trimmedInput.split(/\s+/);
	let triggerPart = "";
	let queryPart = "";

	if (config.forceBangsFirst) {
		if (!trimmedInput.startsWith(symbol)) {
			return { trigger: null, query: trimmedInput, config };
		}
		triggerPart = parts[0].substring(symbol.length).toLowerCase();
		queryPart = parts.slice(1).join(" ");
	} else {
		const triggerIndex = parts.findIndex((p) => p.startsWith(symbol));
		if (triggerIndex === -1) {
			return { trigger: null, query: trimmedInput, config };
		}
		triggerPart = parts[triggerIndex].substring(symbol.length).toLowerCase();
		const remaining = [...parts];
		remaining.splice(triggerIndex, 1);
		queryPart = remaining.join(" ");
	}

	return { trigger: triggerPart, query: queryPart, config };
}

/**
 * Finds a bang entry by trigger.
 */
export async function findBang(trigger: string, useStore = true) {
	let bang = await db.userBangs.where("t").equals(trigger).first();
	if (!bang && useStore) {
		bang = await db.storeBangs.where("t").equals(trigger).first();
	}
	return bang;
}

/**
 * Parses a query string and returns the target redirect URL.
 */
export async function getRedirectUrl(input: string): Promise<string> {
	const { trigger, query, config } = await parseInput(input);

	if (!trigger) {
		return getEngineUrl(config.selectedEngine, config.customUrl, query);
	}

	const bang = await findBang(trigger, config.useStoreBangs);

	if (!bang) {
		return getEngineUrl(config.selectedEngine, config.customUrl, input);
	}

	// 3. Check for sub-routes
	let targetUrl = bang.u;
	let finalQuery = query;

	if (bang.sr && query) {
		const subParts = query.split(/\s+/);
		const subTrigger = subParts[0].toLowerCase();
		const subRoute = bang.sr.find((sr) => sr.t.includes(subTrigger));

		if (subRoute) {
			targetUrl = subRoute.u;
			finalQuery = subParts.slice(1).join(" ");
		}
	}

	// Handle placeholder replacement
	// DuckDuckGo uses {{{s}}}, but some custom ones might use %s
	const placeholder = targetUrl.includes("{{{s}}}") ? "{{{s}}}" : "%s";

	const processedUrl = finalQuery
		? targetUrl.replace(placeholder, encodeURIComponent(finalQuery))
		: targetUrl
				.replace(placeholder, "")
				.replace(/[?&]$/, "")
				.replace(/\?&/, "?");

	return processedUrl;
}

/**
 * Gets the suggestion URL for a given input.
 */
export async function getSuggestionUrl(input: string): Promise<string | null> {
	const { trigger, query, config } = await parseInput(input);

	if (!trigger) return null;

	const bang = await findBang(trigger, config.useStoreBangs);
	if (!bang) return null;

	let suggestionUrl = bang.su;

	// Check sub-routes
	if (bang.sr && query) {
		const subParts = query.split(/\s+/);
		const subTrigger = subParts[0].toLowerCase();
		const subRoute = bang.sr.find((sr) => sr.t.includes(subTrigger));

		if (subRoute?.su) {
			suggestionUrl = subRoute.su;
		}
	}

	if (!suggestionUrl) return null;

	return suggestionUrl.replace("%s", encodeURIComponent(query));
}

/**
 * Fetches suggestions from a suggestion URL.
 * Handles common search engine response formats.
 */
export async function fetchSuggestions(url: string): Promise<string[]> {
	try {
		const response = await fetch(url);
		if (!response.ok) return [];
		const data = await response.json();

		// Google/Bing format: ["query", ["s1", "s2", ...]]
		if (Array.isArray(data) && data.length >= 2 && Array.isArray(data[1])) {
			return data[1];
		}

		// DuckDuckGo format: [{"phrase":"..."}, ...]
		if (
			Array.isArray(data) &&
			data.length > 0 &&
			typeof data[0] === "object" &&
			data[0] !== null &&
			"phrase" in data[0]
		) {
			return data.map((i: unknown) => (i as { phrase: string }).phrase);
		}

		// Fallback for simple arrays
		if (Array.isArray(data)) {
			return data.filter((i) => typeof i === "string");
		}

		return [];
	} catch (err) {
		console.error("Error fetching suggestions:", err);
		return [];
	}
}

import { z } from "zod";
import {
	type AppConfig,
	type BangEntry,
	BangEntrySchema,
	db,
	SETTING_KEYS,
} from "./db";

const DATA_URL = "/data/bangs.json";
let cachedFallback: BangEntry[] | null = null;

async function fetchFallbackBangs() {
	if (cachedFallback) return cachedFallback;
	try {
		const response = await fetch(DATA_URL);
		if (!response.ok) return [];
		const rawData = await response.json();
		cachedFallback = z.array(BangEntrySchema).parse(rawData);
		return cachedFallback;
	} catch (err) {
		console.error("Fallback fetch failed:", err);
		return [];
	}
}

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
	enablePopularity: true,
};

async function getConfig(): Promise<AppConfig> {
	const settings = await db.settings.toArray();
	const configMap = new Map(settings.map((s) => [s.key, s.value]));

	return {
		selectedEngine:
			(configMap.get(SETTING_KEYS.ENGINE) as string) ||
			DEFAULT_CONFIG.selectedEngine,
		customUrl:
			(configMap.get(SETTING_KEYS.CUSTOM_URL) as string) ||
			DEFAULT_CONFIG.customUrl,
		selectedSymbol:
			(configMap.get(SETTING_KEYS.SYMBOL) as string) ||
			DEFAULT_CONFIG.selectedSymbol,
		forceBangsFirst:
			configMap.get(SETTING_KEYS.FORCE_FIRST) === "true" ||
			configMap.get(SETTING_KEYS.FORCE_FIRST) === true,
		useStoreBangs:
			configMap.get(SETTING_KEYS.USE_STORE) === "true" ||
			configMap.get(SETTING_KEYS.USE_STORE) === true,
		enablePopularity:
			configMap.get(SETTING_KEYS.POPULARITY) === "true" ||
			configMap.get(SETTING_KEYS.POPULARITY) === true ||
			configMap.get(SETTING_KEYS.POPULARITY) === undefined,
	};
}

export async function updateConfig(updates: Partial<AppConfig>) {
	const promises: Promise<string>[] = [];

	if (updates.selectedEngine !== undefined) {
		promises.push(
			db.settings.put({
				key: SETTING_KEYS.ENGINE,
				value: updates.selectedEngine,
			}),
		);
	}
	if (updates.customUrl !== undefined) {
		promises.push(
			db.settings.put({
				key: SETTING_KEYS.CUSTOM_URL,
				value: updates.customUrl,
			}),
		);
	}
	if (updates.selectedSymbol !== undefined) {
		promises.push(
			db.settings.put({
				key: SETTING_KEYS.SYMBOL,
				value: updates.selectedSymbol,
			}),
		);
	}
	if (updates.forceBangsFirst !== undefined) {
		promises.push(
			db.settings.put({
				key: SETTING_KEYS.FORCE_FIRST,
				value: String(updates.forceBangsFirst),
			}),
		);
	}
	if (updates.useStoreBangs !== undefined) {
		promises.push(
			db.settings.put({
				key: SETTING_KEYS.USE_STORE,
				value: String(updates.useStoreBangs),
			}),
		);
	}
	if (updates.enablePopularity !== undefined) {
		promises.push(
			db.settings.put({
				key: SETTING_KEYS.POPULARITY,
				value: String(updates.enablePopularity),
			}),
		);
	}

	await Promise.all(promises);
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
 * Logs a bang usage locally in Dexie.
 */
export async function logUsage(trigger: string) {
	try {
		const config = await getConfig();
		if (!config.enablePopularity) return;

		// 1. Log for global sync
		await db.pings.add({
			t: trigger,
			ts: Date.now(),
		});

		// 2. Update local rank instantly for UI feedback
		const localUpdate = async (
			table: typeof db.storeBangs | typeof db.userBangs,
		) => {
			const entry = await table.where("t").equals(trigger).first();
			if (entry && entry.id !== undefined) {
				await table.update(entry.id, { r: (entry.r || 0) + 1 });
			}
		};

		await Promise.all([localUpdate(db.storeBangs), localUpdate(db.userBangs)]);
	} catch (error) {
		console.error("Failed to log usage:", error);
	}
}

/**
 * Finds a bang entry by trigger.
 */
export async function findBang(trigger: string, useStore = true) {
	let bang = await db.userBangs.where("t").equals(trigger).first();
	if (bang) return bang;

	if (useStore) {
		bang = await db.storeBangs.where("t").equals(trigger).first();
		if (bang) return bang;

		// Last resort: check if DB is empty and fallback to JSON
		const dbCount = await db.storeBangs.count();
		if (dbCount === 0) {
			const fallback = await fetchFallbackBangs();
			return fallback?.find((b) => b.t.includes(trigger)) || null;
		}
	}

	return null;
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

	// Log usage for popularity
	logUsage(trigger);

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
 * Gets local suggestions from Dexie based on trigger or name.
 */
export async function getLocalSuggestions(input: string): Promise<BangEntry[]> {
	const trimmed = input.trim();
	const config = await getConfig();
	const symbol = config.selectedSymbol;

	// Only suggest if it starts with the user's selected symbol
	if (!trimmed.startsWith(symbol)) return [];

	const query = trimmed.substring(symbol.length).toLowerCase();
	if (!query) return [];

	// Search in both userBangs and storeBangs
	const [userBangs, storeBangs] = await Promise.all([
		db.userBangs
			.filter(
				(b) =>
					b.t.some((t) => t.toLowerCase().startsWith(query)) ||
					b.s.toLowerCase().includes(query),
			)
			.toArray(),
		db.storeBangs
			.filter(
				(b) =>
					b.t.some((t) => t.toLowerCase().startsWith(query)) ||
					b.s.toLowerCase().includes(query),
			)
			.toArray(),
	]);

	// Merge and sort by rank (popularity)
	const all = [...userBangs, ...storeBangs].sort(
		(a, b) => (b.r || 0) - (a.r || 0),
	);

	// Unique by primary trigger and limit to 10
	const seen = new Set();
	const unique: BangEntry[] = [];
	for (const b of all) {
		const primary = b.t[0];
		if (!seen.has(primary)) {
			seen.add(primary);
			unique.push(b);
		}
		if (unique.length >= 10) break;
	}

	return unique;
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

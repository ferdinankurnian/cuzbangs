import { z } from "zod";
import { normalizeBangEntryTriggers } from "./bangs";
import { BangEntrySchema, db } from "./db";

const DATA_URL = "/data/bangs.json";

let isSyncing = false;

export async function syncBangs(options: { force?: boolean } = {}) {
	if (isSyncing) return;

	const now = new Date();
	const hours = now.getHours();
	const windowId = hours < 12 ? "AM" : "PM";
	const currentWindowKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${windowId}`;

	const lastSyncWindow = localStorage.getItem("last-sync-window");
	if (!options.force && lastSyncWindow === currentWindowKey) {
		return;
	}

	isSyncing = true;

	try {
		console.log("Starting bangs sync...");
		const response = await fetch(DATA_URL);
		if (!response.ok) throw new Error("Failed to fetch bangs.json");

		const lastModified = response.headers.get("last-modified");
		const storedLastModified = localStorage.getItem("bangs-last-modified");
		const dbCount = await db.storeBangs.count();

		const shouldFetch =
			!lastModified ||
			!storedLastModified ||
			lastModified !== storedLastModified ||
			dbCount === 0;

		if (shouldFetch) {
			console.log("Fetching fresh bangs.json...");
			const rawData = await response.json();
			const entries = z
				.array(BangEntrySchema)
				.parse(rawData)
				.map(normalizeBangEntryTriggers)
				.filter((entry) => entry.t.length > 0);
			await db.storeBangs.clear();
			await db.storeBangs.bulkAdd(entries);
			console.log(`Synced ${entries.length} bangs.`);
		} else {
			console.log("Bangs data is up to date.");
		}

		if (lastModified && shouldFetch) {
			localStorage.setItem("bangs-last-modified", lastModified);
		}

		localStorage.setItem("last-sync-window", currentWindowKey);
	} catch (error) {
		console.error("Error syncing bangs:", error);
	} finally {
		isSyncing = false;
	}
}

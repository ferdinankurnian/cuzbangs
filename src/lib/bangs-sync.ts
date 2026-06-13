import { db } from "./db";
import { fetchStoreBangs } from "./store-bangs";

let isSyncing = false;

export async function syncBangs(options: { force?: boolean } = {}) {
	if (isSyncing) return false;

	const now = new Date();
	const hours = now.getHours();
	const windowId = hours < 12 ? "AM" : "PM";
	const currentWindowKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${windowId}`;

	const lastSyncWindow = localStorage.getItem("last-sync-window");
	if (!options.force && lastSyncWindow === currentWindowKey) {
		return true;
	}

	isSyncing = true;

	try {
		console.log("Starting bangs sync...");
		const dbCount = await db.storeBangs.count();
		const shouldFetch = options.force || dbCount === 0;

		if (shouldFetch) {
			console.log("Fetching fresh store bangs...");
			const entries = await fetchStoreBangs({ force: options.force });
			await db.storeBangs.clear();
			await db.storeBangs.bulkAdd(entries);
			console.log(`Synced ${entries.length} bangs.`);
		} else {
			console.log("Bangs data is up to date.");
		}

		localStorage.setItem("last-sync-window", currentWindowKey);
		return true;
	} catch (error) {
		console.error("Error syncing bangs:", error);
		return false;
	} finally {
		isSyncing = false;
	}
}

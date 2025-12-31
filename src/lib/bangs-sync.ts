import { z } from "zod";
import { BangEntrySchema, db } from "./db";

const DATA_URL = "/data/bangs.json";

let isSyncing = false;

export async function syncBangs() {
	if (isSyncing) return;
	isSyncing = true;

	try {
		console.log("Starting bangs sync...");
		const response = await fetch(DATA_URL);
		if (!response.ok) throw new Error("Failed to fetch bangs.json");

		const rawData = await response.json();
		const entries = z.array(BangEntrySchema).parse(rawData);

		// Clear existing bangs to prevent duplicates and ensure fresh data
		await db.storeBangs.clear();
		await db.storeBangs.bulkAdd(entries);

		console.log(`Successfully synced ${entries.length} bangs.`);
	} catch (error) {
		console.error("Error syncing bangs:", error);
	} finally {
		isSyncing = false;
	}
}

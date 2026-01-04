import type { ConvexHttpClient } from "convex/browser";
import type { ConvexReactClient } from "convex/react";
import { z } from "zod";
import { api } from "../../convex/_generated/api";
import { type BangEntry, BangEntrySchema, db } from "./db";

const DATA_URL = "/data/bangs.json";

let isSyncing = false;

export async function syncBangs(convex?: ConvexHttpClient | ConvexReactClient) {
	if (isSyncing) return;
	isSyncing = true;

	try {
		console.log("Starting bangs sync...");
		const response = await fetch(DATA_URL);
		if (!response.ok) throw new Error("Failed to fetch bangs.json");

		const lastModified = response.headers.get("last-modified");
		const storedLastModified = localStorage.getItem("bangs-last-modified");
		const dbCount = await db.storeBangs.count();

		let entries: BangEntry[] = [];
		const shouldFetchBase =
			!lastModified ||
			!storedLastModified ||
			lastModified !== storedLastModified ||
			dbCount === 0;

		if (shouldFetchBase) {
			console.log("Fetching fresh bangs.json...");
			const rawData = await response.json();
			entries = z.array(BangEntrySchema).parse(rawData);
		} else {
			console.log("Bangs base data is up to date.");
			// We still need the entries to update their 'r' field from global popularity
			// but loading all of them from Dexie just to update 'r' might be slow.
			// For now, let's load them if we want to refresh 'r'.
			entries = await db.storeBangs.toArray();
		}

		// 1. Fetch Popularity from Convex
		let globalPopularity: Record<string, number> = {};
		if (convex) {
			try {
				globalPopularity = await convex.query(api.popularity.getAllPopularity);
			} catch (err) {
				console.error("Failed to fetch global popularity:", err);
			}
		}

		// 2. Clear and bulk add with global hits (or update)
		// If we load all entries, bulkAdd is safer to ensure consistency
		const entriesWithPopularity = entries.map((entry) => {
			const primaryTrigger = entry.t[0];
			return {
				...entry,
				r: globalPopularity[primaryTrigger] || 0,
			};
		});

		await db.storeBangs.clear();
		await db.storeBangs.bulkAdd(entriesWithPopularity);

		// 3. Push pending local hits to Convex
		if (convex) {
			const pendingPings = await db.pings.toArray();
			if (pendingPings.length > 0) {
				const triggersToReport = pendingPings.map((p) => p.t);
				try {
					console.log(`Syncing ${pendingPings.length} hits to Convex...`);
					await convex.mutation(api.popularity.incrementHits, {
						triggers: triggersToReport,
					});
					await db.pings.bulkDelete(
						pendingPings
							.map((p) => p.id)
							.filter((id): id is number => id !== undefined),
					);
					console.log("Hits synced successfully.");
				} catch (err) {
					console.error("Failed to sync local hits to Convex:", err);
				}
			}
		}

		if (lastModified && shouldFetchBase) {
			localStorage.setItem("bangs-last-modified", lastModified);
		}

		console.log(`Successfully synced ${entries.length} bangs.`);
	} catch (error) {
		console.error("Error syncing bangs:", error);
	} finally {
		isSyncing = false;
	}
}

import { z } from "zod";
import { type BangEntry, BangEntrySchema, db } from "./db";
import { POPULARITY_KEY, redis } from "./redis";

const DATA_URL = "/data/bangs.json";

let isSyncing = false;

export async function syncBangs(
	options: { popularity?: boolean; force?: boolean } = {},
) {
	if (isSyncing) return;

	// 1. Local Time Window Logic (AM/PM)
	const now = new Date();
	const hours = now.getHours();
	const windowId = hours < 12 ? "AM" : "PM";
	const currentWindowKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${windowId}`;

	// Check if we already synced in this window
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
			entries = await db.storeBangs.toArray();
		}

		const lastReadWindow = localStorage.getItem("last-popularity-window-read");
		const lastPushWindow = localStorage.getItem("last-popularity-window-push");

		let globalPopularity: Record<string, number> = {};

		// Only pull if requested explicitly (e.g. from Store page) AND time window changed
		const shouldPull =
			options.popularity && lastReadWindow !== currentWindowKey;

		// --- STEP 1: PULL (Fetch from Redis) ---
		if (shouldPull) {
			try {
				console.log(
					`[Store] New local window (${windowId}), pulling from Redis...`,
				);
				const data =
					await redis.hgetall<Record<string, number | string>>(POPULARITY_KEY);
				if (data) {
					globalPopularity = Object.entries(data).reduce(
						(acc, [key, val]) => {
							acc[key] =
								typeof val === "string"
									? Number.parseInt(val, 10)
									: (val as number);
							return acc;
						},
						{} as Record<string, number>,
					);
					localStorage.setItem(
						"global-popularity-cache",
						JSON.stringify(globalPopularity),
					);
					localStorage.setItem("last-popularity-window-read", currentWindowKey);
				}
			} catch (err) {
				console.error("Failed to pull from Redis:", err);
			}
		} else {
			const cached = localStorage.getItem("global-popularity-cache");
			if (cached) globalPopularity = JSON.parse(cached);
		}

		// --- STEP 2: UPDATE DEXIE (If base changed OR pulled) ---
		if (shouldFetchBase || shouldPull) {
			const entriesWithPopularity = entries.map((entry) => {
				const primaryTrigger = entry.t[0];
				return {
					...entry,
					r: globalPopularity[primaryTrigger] || entry.r || 0,
				};
			});
			await db.storeBangs.clear();
			await db.storeBangs.bulkAdd(entriesWithPopularity);
		}

		// --- STEP 3: PUSH (Setoran pings semalem/tadi pagi) ---
		const shouldPush = lastPushWindow !== currentWindowKey;
		if (shouldPush) {
			// Find pings that happened BEFORE the current window started
			const windowStart = new Date(now);
			windowStart.setHours(hours < 12 ? 0 : 12, 0, 0, 0);

			const pendingPings = await db.pings
				.where("ts")
				.below(windowStart.getTime())
				.toArray();

			if (pendingPings.length > 0) {
				try {
					console.log(
						`[Setoran] Pushing ${pendingPings.length} pings from previous window...`,
					);
					const pipeline = redis.pipeline();
					for (const ping of pendingPings) {
						pipeline.hincrby(POPULARITY_KEY, ping.t, 1);
					}
					await pipeline.exec();
					await db.pings.bulkDelete(
						pendingPings
							.map((p) => p.id)
							.filter((id): id is number => id !== undefined),
					);
					localStorage.setItem("last-popularity-window-push", currentWindowKey);
				} catch (err) {
					console.error("Failed to push pings to Redis:", err);
				}
			} else {
				localStorage.setItem("last-popularity-window-push", currentWindowKey);
			}
		}

		if (lastModified && shouldFetchBase) {
			localStorage.setItem("bangs-last-modified", lastModified);
		}

		localStorage.setItem("last-sync-window", currentWindowKey);
		console.log(`Successfully synced ${entries.length} bangs.`);
	} catch (error) {
		console.error("Error syncing bangs:", error);
	} finally {
		isSyncing = false;
	}
}

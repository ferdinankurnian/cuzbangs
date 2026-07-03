import { z } from "zod";
import {
	normalizeBangEntryTriggers,
	normalizeBangTriggers,
} from "./bangs";
import { type BangEntry, BangEntrySchema } from "./db";

const KAGI_DATA_URL = "/data/bangs.json";
const CUSTOM_DATA_URL = "/data/cuzbangs.json";

let cachedStoreBangs: BangEntry[] | null = null;

async function fetchBangFile(
	url: string,
	required: boolean,
	presetSource: "kagi" | "cuzbangs",
) {
	const response = await fetch(url);
	if (!response.ok) {
		if (required) throw new Error(`Failed to fetch ${url}`);
		return [];
	}

	const rawData = await response.json();
	return z
		.array(BangEntrySchema)
		.parse(rawData)
		.map(normalizeBangEntryTriggers)
		.map((entry) => ({ ...entry, presetSource }))
		.filter((entry) => entry.t.length > 0);
}

function isSameBang(left: BangEntry, right: BangEntry) {
	return (
		left.s.trim().toLowerCase() === right.s.trim().toLowerCase() &&
		left.d.trim().toLowerCase() === right.d.trim().toLowerCase()
	);
}

function mergeStoreBangs(kagiBangs: BangEntry[], customBangs: BangEntry[]) {
	const customTriggers = new Set(
		customBangs.flatMap((bang) => normalizeBangTriggers(bang.t)),
	);
	const merged: BangEntry[] = [];

	for (const bang of kagiBangs) {
		const keptTriggers = normalizeBangTriggers(bang.t).filter(
			(trigger) => !customTriggers.has(trigger),
		);
		if (keptTriggers.length > 0) merged.push({ ...bang, t: keptTriggers });
	}

	for (const customBang of customBangs) {
		const matchingBang = merged.find((bang) => isSameBang(bang, customBang));

		if (!matchingBang) {
			merged.push(customBang);
			continue;
		}

		const mergedTriggers = normalizeBangTriggers([
			...customBang.t,
			...matchingBang.t,
		]);
		Object.assign(matchingBang, customBang, { t: mergedTriggers });
	}

	return merged;
}

export async function fetchStoreBangs(options: { force?: boolean } = {}) {
	if (cachedStoreBangs && !options.force) return cachedStoreBangs;

	const [kagiBangs, customBangs] = await Promise.all([
		fetchBangFile(KAGI_DATA_URL, true, "kagi"),
		fetchBangFile(CUSTOM_DATA_URL, false, "cuzbangs"),
	]);

	cachedStoreBangs = mergeStoreBangs(kagiBangs, customBangs);
	return cachedStoreBangs;
}

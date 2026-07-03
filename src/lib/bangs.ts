import type { BangEntry } from "./db";

export function normalizeTrigger(trigger: string) {
	return trigger.trim().toLowerCase();
}

export function normalizeBangTriggers(triggers: string[]) {
	const seen = new Set<string>();
	const normalizedTriggers: string[] = [];

	for (const trigger of triggers) {
		const normalized = normalizeTrigger(trigger);
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		normalizedTriggers.push(normalized);
	}

	return normalizedTriggers;
}

export function normalizeBangEntryTriggers<T extends { t: string[] }>(
	bang: T,
): T {
	return {
		...bang,
		t: normalizeBangTriggers(bang.t),
		...(Array.isArray((bang as T & { sr?: { t: string[] }[] }).sr)
			? {
					sr: (bang as T & { sr: { t: string[] }[] }).sr.map((subroute) => ({
						...subroute,
						t: normalizeBangTriggers(subroute.t),
					})),
				}
			: {}),
	};
}

export function getPrimaryTrigger(bang: Pick<BangEntry, "t" | "s">) {
	return normalizeBangTriggers(bang.t)[0] ?? normalizeTrigger(bang.s);
}

export function bangHasTrigger(bang: Pick<BangEntry, "t">, trigger: string) {
	const normalizedTrigger = normalizeTrigger(trigger);
	if (!normalizedTrigger) return false;
	return normalizeBangTriggers(bang.t).includes(normalizedTrigger);
}

export function getTriggerCollisions(
	bangs: BangEntry[],
	triggers: string[],
	excludeId?: number,
) {
	const wantedTriggers = new Set(normalizeBangTriggers(triggers));
	const collisions = new Set<string>();

	if (wantedTriggers.size === 0) return [];

	for (const bang of bangs) {
		if (excludeId !== undefined && bang.id === excludeId) continue;

		for (const trigger of normalizeBangTriggers(bang.t)) {
			if (wantedTriggers.has(trigger)) collisions.add(trigger);
		}
	}

	return [...collisions];
}

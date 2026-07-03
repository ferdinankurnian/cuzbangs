import { readFile } from "node:fs/promises";

const kagiPath = "public/data/bangs.json";
const customPath = "public/data/cuzbangs.json";

function normalizeTrigger(trigger) {
	return String(trigger).trim().toLowerCase();
}

function normalizeTriggers(triggers) {
	const seen = new Set();
	const normalized = [];

	for (const trigger of triggers) {
		const value = normalizeTrigger(trigger);
		if (!value || seen.has(value)) continue;
		seen.add(value);
		normalized.push(value);
	}

	return normalized;
}

async function readJson(filePath) {
	const json = await readFile(filePath, "utf8");
	return JSON.parse(json);
}

function normalizeBang(rawBang, source, index) {
	const location = `${source}[${index}]`;
	if (!rawBang || typeof rawBang !== "object" || Array.isArray(rawBang)) {
		throw new Error(`${location} must be an object`);
	}

	const rawTriggers = Array.isArray(rawBang.t) ? rawBang.t : [rawBang.t];
	const triggers = normalizeTriggers([...rawTriggers, ...(rawBang.ts ?? [])]);

	if (triggers.length === 0) {
		throw new Error(`${location} needs at least one trigger`);
	}
	if (typeof rawBang.s !== "string" || rawBang.s.trim() === "") {
		throw new Error(`${location} needs a non-empty s/name`);
	}
	if (typeof rawBang.d !== "string" || rawBang.d.trim() === "") {
		throw new Error(`${location} needs a non-empty d/domain`);
	}
	if (typeof rawBang.u !== "string" || rawBang.u.trim() === "") {
		throw new Error(`${location} needs a non-empty u/url`);
	}
	if (rawBang.b !== undefined) {
		throw new Error(`${location}.b is only supported inside sr subroutes`);
	}

	const subroutes = normalizeSubroutes(rawBang.sr, location);

	return {
		triggers,
		name: rawBang.s,
		domain: rawBang.d,
		subroutes,
	};
}

function normalizeSubroutes(rawSubroutes, parentLocation) {
	if (rawSubroutes === undefined) return [];
	if (!Array.isArray(rawSubroutes)) {
		throw new Error(`${parentLocation}.sr must be an array`);
	}

	const subroutes = [];
	const seen = new Map();

	for (const [index, rawSubroute] of rawSubroutes.entries()) {
		const location = `${parentLocation}.sr[${index}]`;
		if (
			!rawSubroute ||
			typeof rawSubroute !== "object" ||
			Array.isArray(rawSubroute)
		) {
			throw new Error(`${location} must be an object`);
		}

		const rawTriggers = Array.isArray(rawSubroute.t)
			? rawSubroute.t
			: [rawSubroute.t];
		const triggers = normalizeTriggers(rawTriggers);
		if (triggers.length === 0) {
			throw new Error(`${location} needs at least one trigger`);
		}
		if (typeof rawSubroute.s !== "string" || rawSubroute.s.trim() === "") {
			throw new Error(`${location} needs a non-empty s/name`);
		}
		if (typeof rawSubroute.u !== "string" || rawSubroute.u.trim() === "") {
			throw new Error(`${location} needs a non-empty u/url`);
		}
		if (typeof rawSubroute.b !== "string" || rawSubroute.b.trim() === "") {
			throw new Error(`${location} needs a non-empty b/base url`);
		}

		for (const trigger of triggers) {
			const previous = seen.get(trigger);
			if (previous) {
				throw new Error(
					`${location} duplicate subroute trigger "${trigger}" also used by ${previous}`,
				);
			}
			seen.set(trigger, location);
		}

		subroutes.push({ triggers, name: rawSubroute.s });
	}

	return subroutes;
}

function isSameBang(left, right) {
	return (
		left.name.trim().toLowerCase() === right.name.trim().toLowerCase() &&
		left.domain.trim().toLowerCase() === right.domain.trim().toLowerCase()
	);
}

function indexByTrigger(bangs) {
	const index = new Map();
	const duplicateTriggers = [];

	for (const bang of bangs) {
		for (const trigger of bang.triggers) {
			const previous = index.get(trigger);
			if (previous) duplicateTriggers.push({ trigger, previous, current: bang });
			index.set(trigger, bang);
		}
	}

	return { index, duplicateTriggers };
}

const kagiBangs = (await readJson(kagiPath)).map((bang, index) =>
	normalizeBang(bang, "kagi", index),
);
const customBangs = (await readJson(customPath)).map((bang, index) =>
	normalizeBang(bang, "cuzbangs", index),
);

const { index: kagiByTrigger } = indexByTrigger(kagiBangs);
const { duplicateTriggers } = indexByTrigger(customBangs);
const conflicts = [];

for (const customBang of customBangs) {
	for (const trigger of customBang.triggers) {
		const kagiBang = kagiByTrigger.get(trigger);
		if (!kagiBang) continue;
		if (isSameBang(customBang, kagiBang)) continue;
		conflicts.push({ trigger, customBang, kagiBang });
	}
}

console.log(`Kagi bangs: ${kagiBangs.length}`);
console.log(`Custom bangs: ${customBangs.length}`);

const customSubroutesCount = customBangs.reduce(
	(count, bang) => count + bang.subroutes.length,
	0,
);
if (customSubroutesCount > 0) {
	console.log(`Custom subroutes: ${customSubroutesCount}`);
}

if (duplicateTriggers.length > 0) {
	console.warn(
		`\nWarning: ${duplicateTriggers.length} duplicate custom trigger(s):`,
	);
	for (const { trigger, previous, current } of duplicateTriggers) {
		console.warn(`- !${trigger}: "${current.name}" duplicates "${previous.name}"`);
	}
}

if (conflicts.length > 0) {
	console.warn(
		`\nWarning: ${conflicts.length} custom trigger conflict(s) with Kagi:`,
	);
	for (const { trigger, customBang, kagiBang } of conflicts) {
		console.warn(
			`- !${trigger}: "${customBang.name}" collides with "${kagiBang.name}"`,
		);
	}
}

if (duplicateTriggers.length === 0 && conflicts.length === 0) {
	console.log("No custom bang collisions found.");
}

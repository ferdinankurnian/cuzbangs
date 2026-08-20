import { mkdir, writeFile } from "node:fs/promises";

const repository = "kagisearch/bangs";
const requestedTag = process.argv[2];

async function fetchJson(url) {
	const response = await fetch(url, {
		headers: { Accept: "application/vnd.github+json" },
	});
	if (!response.ok) {
		throw new Error(`${response.status} ${response.statusText}: ${url}`);
	}
	return response.json();
}

const tag =
	requestedTag ??
	(await fetchJson(`https://api.github.com/repos/${repository}/releases/latest`))
		.tag_name;

function normalizeBang(bang) {
	const triggers = [bang.t, ...(bang.ts ?? [])].filter(Boolean);
	const { ts: _legacyTriggers, ...withoutLegacyTriggers } = bang;
	return { ...withoutLegacyTriggers, t: [...new Set(triggers)] };
}

const baseUrl = `https://raw.githubusercontent.com/${repository}/${tag}/data`;
const bangs = await fetchJson(`${baseUrl}/bangs.json`);
const normalized = bangs.map(normalizeBang);

await mkdir("public/data", { recursive: true });
await writeFile("public/data/bangs.json", `${JSON.stringify(normalized)}\n`);

console.log(`Synced ${normalized.length} bangs from ${tag}.`);

// Generates public/data/changelog.json from recent git history.
// Runs automatically via the `prebuild` script, so every build ships
// fresh patch notes. Skipped gracefully when git is unavailable.
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const SEP = "";

try {
	const raw = execSync(
		"git log -40 --no-merges --format=%h%x1f%ad%x1f%s --date=short",
		{ encoding: "utf8" },
	).trim();
	const entries = raw
		.split("\n")
		.filter(Boolean)
		.map((line) => {
			const [sha, date, subject] = line.split(SEP);
			return { sha, date, subject };
		});
	mkdirSync("public/data", { recursive: true });
	writeFileSync(
		"public/data/changelog.json",
		`${JSON.stringify({ generatedAt: new Date().toISOString(), entries }, null, 2)}\n`,
	);
	console.log(`changelog: wrote ${entries.length} entries`);
} catch {
	console.log("changelog: git unavailable, skipping");
}

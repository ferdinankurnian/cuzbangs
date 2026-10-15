// Embeds the GitHub release (version + curated notes) into the build.
// Runs automatically via the `prebuild` script.
//
// Sources, in order:
// 1. RELEASE_TAG + RELEASE_NOTES env (set by CI on release published)
// 2. Exact git tag on HEAD + its release body via `gh api` (local release build)
// 3. Fallback: no release (dev build, empty notes)
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

function sh(cmd) {
	return execSync(cmd, { encoding: "utf8" }).trim();
}

let version = null;
let notes = "";

try {
	if (process.env.RELEASE_TAG) {
		version = process.env.RELEASE_TAG;
		notes = process.env.RELEASE_NOTES ?? "";
	} else {
		const tag = sh("git describe --tags --exact-match HEAD");
		version = tag;
		try {
			notes = sh(
				`gh api repos/ferdinankurnian/cuzbangs/releases/tags/${tag} --jq .body`,
			);
		} catch {
			notes = "";
		}
	}
} catch {
	version = null;
}

mkdirSync("public/data", { recursive: true });
writeFileSync(
	"public/data/release.json",
	`${JSON.stringify({ version, notes, generatedAt: new Date().toISOString() }, null, 2)}\n`,
);
console.log(
	version
		? `release: embedded ${version} (${notes.length} chars of notes)`
		: "release: no tag found, shipping without release notes",
);

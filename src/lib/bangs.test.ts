import { describe, expect, it } from "vitest";
import {
	bangHasTrigger,
	normalizeBangTriggers,
	normalizeTrigger,
} from "./bangs";

describe("bang normalization", () => {
	it("normalizes a trigger", () => {
		expect(normalizeTrigger("  YT ")).toBe("yt");
	});

	it("normalizes and deduplicates trigger arrays", () => {
		expect(normalizeBangTriggers(["YT", " yt ", "GH"])).toEqual(["yt", "gh"]);
	});

	it("matches triggers case-insensitively", () => {
		expect(bangHasTrigger({ t: ["yt", "youtube"] }, "YT")).toBe(true);
	});
});

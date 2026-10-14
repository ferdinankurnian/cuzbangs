import { describe, expect, it } from "vitest";
import { appendNoAiSuffix, getEngineUrl } from "./engine";

describe("default search engine URLs", () => {
	it("appends the suffix to the outgoing query", () => {
		expect(appendNoAiSuffix("i think i am cat")).toBe("i think i am cat -ai");
	});

	it("appends -ai to Google searches when enabled", () => {
		expect(getEngineUrl("google", "", "what is a cat", true)).toBe(
			"https://www.google.com/search?q=what%20is%20a%20cat%20-ai",
		);
	});

	it("appends -ai to Bing searches when enabled", () => {
		expect(getEngineUrl("bing", "", "what is a cat", true)).toBe(
			"https://www.bing.com/search?q=what%20is%20a%20cat%20-ai",
		);
	});

	it("does not duplicate an existing -ai suffix", () => {
		expect(getEngineUrl("google", "", "what is a cat -ai", true)).toBe(
			"https://www.google.com/search?q=what%20is%20a%20cat%20-ai",
		);
		expect(getEngineUrl("google", "", "what is a cat -ai   ", true)).toBe(
			"https://www.google.com/search?q=what%20is%20a%20cat%20-ai",
		);
		expect(getEngineUrl("bing", "", "what is a cat -ai", true)).toBe(
			"https://www.bing.com/search?q=what%20is%20a%20cat%20-ai",
		);
	});

	it("only applies the suffix to Google and Bing", () => {
		expect(getEngineUrl("duckduckgo", "", "what is a cat", true)).toBe(
			"https://duckduckgo.com/?q=what%20is%20a%20cat",
		);
	});
});

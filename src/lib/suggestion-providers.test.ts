import { describe, expect, it, vi } from "vitest";
import { handleSuggestion } from "../../functions/suggestions";
import {
	getBuiltInSuggestionUrl,
	isAllowedSuggestionTarget,
} from "./suggestion-providers";

describe("suggestion providers", () => {
	it("builds the built-in provider URL", () => {
		expect(getBuiltInSuggestionUrl("google", "what is a cat?")).toBe(
			"https://www.google.com/complete/search?client=chrome&q=what%20is%20a%20cat%3F",
		);
	});

	it("allows only HTTPS built-in providers", () => {
		expect(
			isAllowedSuggestionTarget("https://api.bing.com/osjson.aspx?query=cat"),
		).toBe(true);
		expect(isAllowedSuggestionTarget("http://api.bing.com/osjson.aspx")).toBe(
			false,
		);
		expect(isAllowedSuggestionTarget("https://example.com/data")).toBe(false);
		expect(isAllowedSuggestionTarget("https://api.bing.com:8443/data")).toBe(
			false,
		);
	});

	it("does not fetch an arbitrary proxy target", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(
				new Response(JSON.stringify(["cat", ["cat videos"]]), { status: 200 }),
			);

		await handleSuggestion(
			new Request(
				"https://cuzbangs.example/suggestions?q=cat&proxy_target=https%3A%2F%2Fexample.com%2Fsecret",
			),
		);

		expect(fetchMock).toHaveBeenCalledWith(
			"https://www.google.com/complete/search?client=chrome&q=cat",
			expect.any(Object),
		);
		fetchMock.mockRestore();
	});
});

/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";
import { getRedirectUrl, getSuggestionUrl } from "./lib/engine";

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

const SUGGESTION_CACHE = "suggestions-v1";

self.addEventListener("fetch", (event: FetchEvent) => {
	const url = new URL(event.request.url);

	if (url.pathname === "/go") {
		const query = url.searchParams.get("q");
		if (query) {
			event.respondWith(
				(async () => {
					try {
						const redirectUrl = await getRedirectUrl(query);
						return Response.redirect(redirectUrl, 302);
					} catch (error) {
						return fetch(event.request);
					}
				})(),
			);
		}
	}

	if (url.pathname === "/suggestions") {
		const query = url.searchParams.get("q");
		
		if (query && !url.searchParams.has("sw-internal")) {
			console.log(`[SW] Intercepting suggestions for: ${query}`);
			event.respondWith(
				(async () => {
					try {
						const targetUrl = await getSuggestionUrl(query);
						
						if (!targetUrl) {
							console.log("[SW] Suggestions are DISABLED or URL is empty.");
							return new Response(JSON.stringify([query, []]), {
								headers: { "Content-Type": "application/json" },
							});
						}

						console.log(`[SW] Fetching from: ${targetUrl}`);

						const proxyRequestUrl = new URL("/suggestions", self.location.origin);
						proxyRequestUrl.searchParams.set("q", query);
						proxyRequestUrl.searchParams.set("proxy_target", targetUrl);
						proxyRequestUrl.searchParams.set("sw-internal", "true");

						const cache = await caches.open(SUGGESTION_CACHE);
						const cachedResponse = await cache.match(proxyRequestUrl);

						const networkFetch = fetch(proxyRequestUrl).then(async (res) => {
							if (res.ok) {
								const clone = res.clone();
								const data = await clone.json();
								if (Array.isArray(data) && data[1] && data[1].length > 0) {
									cache.put(proxyRequestUrl, res.clone());
								}
							}
							return res;
						});

						if (cachedResponse) {
							console.log("[SW] Found in cache!");
							event.waitUntil(networkFetch);
							return cachedResponse;
						}

						return networkFetch;
					} catch (error) {
						console.error("[SW] Error:", error);
						return new Response(JSON.stringify([query, []]), {
							headers: { "Content-Type": "application/json" },
						});
					}
				})(),
			);
		}
	}
});

self.addEventListener("install", () => {
	self.skipWaiting();
});

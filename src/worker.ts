import suggestionsHandler from "../functions/suggestions";

export interface Env {
	ASSETS: {
		fetch: (request: Request) => Promise<Response>;
	};
}

export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url);

		// 1. Route ke Suggestions
		if (url.pathname === "/suggestions") {
			return (suggestionsHandler as any).fetch(request);
		}

		// 2. Serve static assets, fallback ke index.html buat SPA routing
		const assetResponse = await env.ASSETS.fetch(request);
		if (assetResponse.status === 200) {
			return assetResponse;
		}

		// File gak ada → serve index.html supaya TanStack Router handle routing di client
		return env.ASSETS.fetch(new Request(new URL("/", url.origin).toString(), request));
	},
};

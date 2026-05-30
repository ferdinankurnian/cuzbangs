import { createFileRoute, redirect } from "@tanstack/react-router";
import { syncBangs } from "@/lib/bangs-sync";
import { getRedirectUrl } from "@/lib/engine";

export const Route = createFileRoute("/go")({
	validateSearch: (search: Record<string, unknown>) => {
		return {
			q: search.q as string | undefined,
		};
	},
	beforeLoad: async ({ search }) => {
		const query = search.q;
		if (!query) {
			throw redirect({ to: "/" });
		}

		syncBangs().catch(console.error);

		const targetUrl = await getRedirectUrl(query);
		// Using window.location.href for external redirects
		window.location.href = targetUrl;
	},
	component: () => <div>Redirecting...</div>,
});

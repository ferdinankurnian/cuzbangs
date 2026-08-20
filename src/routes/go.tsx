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
		if (localStorage.getItem("cuzbangs-consent") !== "true") {
			throw redirect({ to: "/get-started" });
		}

		const query = search.q;
		if (!query) {
			throw redirect({ to: "/" });
		}

		syncBangs().catch(console.error);

		const targetUrl = await getRedirectUrl(query);
		window.location.replace(targetUrl);
	},
	component: () => <div>Redirecting...</div>,
});

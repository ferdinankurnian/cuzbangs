import { createFileRoute, redirect } from "@tanstack/react-router";

/** Retained as a stable redirect for old links; the former demo is not shipped. */
export const Route = createFileRoute("/test-modal")({
	beforeLoad: () => {
		throw redirect({ to: "/" });
	},
	component: () => null,
});

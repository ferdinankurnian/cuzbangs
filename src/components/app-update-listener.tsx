import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { subscribeAppUpdate, updateApp } from "@/lib/app-update";

export function AppUpdateListener() {
	const shown = useRef(false);

	useEffect(() => {
		return subscribeAppUpdate((state) => {
			if (!state.needRefresh || shown.current) return;
			shown.current = true;
			toast("New version of cuzbangs is available", {
				id: "cuzbangs-update",
				description:
					"Update to get the latest bangs and features. Takes a second.",
				duration: Infinity,
				action: {
					label: "Update",
					onClick: () => {
						void updateApp();
					},
				},
			});
		});
	}, []);

	return null;
}

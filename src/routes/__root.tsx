import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { setupAppUpdate } from "@/lib/app-update";
import { AppUpdateListener } from "../components/app-update-listener";
import { Navbar } from "../components/navbar";
import { AppProvider } from "../components/providers/app-provider";
import { ThemeProvider } from "../components/providers/theme-provider";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	useEffect(() => {
		setupAppUpdate();
	}, []);

	return (
		<AppProvider>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<Navbar />
				<Outlet />
				<Toaster />
				<AppUpdateListener />
			</ThemeProvider>
		</AppProvider>
	);
}

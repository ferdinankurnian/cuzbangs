import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "../components/navbar";
import { ThemeProvider } from "../components/providers/theme-provider";
import { AppProvider } from "../components/providers/app-provider";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<AppProvider>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<Navbar />
				<Outlet />
			</ThemeProvider>
		</AppProvider>
	);
}

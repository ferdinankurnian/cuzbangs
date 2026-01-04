import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "../components/navbar";
import { AppProvider } from "../components/providers/app-provider";
import { ThemeProvider } from "../components/providers/theme-provider";

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

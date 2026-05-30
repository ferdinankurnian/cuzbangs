import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import {
	ChevronRight,
	CircleHelp,
	LibraryBig,
	SlidersHorizontal,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/settings")({
	component: SettingsLayout,
	beforeLoad: ({ location }) => {
		// Redirect /settings to /settings/mybangs
		if (location.pathname === "/settings") {
			throw redirect({ to: "/settings/mybangs" });
		}
	},
});

const tabs = [
	{
		value: "mybangs",
		label: "My Bangs",
		path: "/settings/mybangs",
		icon: LibraryBig,
	},
	{
		value: "configs",
		label: "Configs",
		path: "/settings/configs",
		icon: SlidersHorizontal,
	},
	{
		value: "about",
		label: "About",
		path: "/settings/about",
		icon: CircleHelp,
	},
];

function SettingsLayout() {
	const navigate = useNavigate();
	const location = useLocation();

	// Get current tab from URL
	const currentTab = location.pathname.split("/").pop() || "mybangs";

	const handleTabChange = (value: string) => {
		navigate({ to: `/settings/${value}` });
	};

	return (
		<div className="min-h-screen px-4 pb-24 pt-28 sm:px-6 lg:px-8">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
				<div className="lg:hidden">
					<Tabs
						value={currentTab}
						onValueChange={handleTabChange}
						className="w-full"
					>
						<TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl bg-muted/80 p-1">
							{tabs.map((tab) => (
								<TabsTrigger
									key={tab.value}
									value={tab.value}
									className="rounded-xl px-3 py-2 text-sm"
								>
									{tab.label}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				</div>

				<aside className="hidden w-full max-w-xs shrink-0 lg:block">
					<div className="sticky top-24 rounded-xl border bg-card/80 p-3 shadow-sm backdrop-blur">
						<div className="px-3 py-2">
							<h1 className="text-2xl font-semibold">Settings</h1>
						</div>

						<nav className="mt-3 space-y-1">
							{tabs.map((tab) => {
								const Icon = tab.icon;

								return (
									<Link
										key={tab.value}
										to={tab.path}
										activeProps={{
											className: "bg-primary text-primary-foreground shadow-sm",
										}}
										inactiveProps={{
											className:
												"text-muted-foreground hover:bg-accent hover:text-accent-foreground",
										}}
										className="group flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors active:scale-[0.98]"
									>
										<Icon className="size-4 shrink-0" />
										<span className="min-w-0 flex-1 font-medium">
											{tab.label}
										</span>
										<ChevronRight className="size-4 shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5" />
									</Link>
								);
							})}
						</nav>
					</div>
				</aside>

				<div className="min-w-0 flex-1">
					<Outlet />
				</div>
			</div>
		</div>
	);
}

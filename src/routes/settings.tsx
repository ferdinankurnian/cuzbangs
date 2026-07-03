import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
	ChevronRight,
	CircleHelp,
	LibraryBig,
	Search,
	SlidersHorizontal,
} from "lucide-react";
import { AboutPanel } from "@/components/settings/about-panel";
import { ConfigsPanel } from "@/components/settings/configs-panel";
import { MyBangsPanel } from "@/components/settings/my-bangs-panel";
import { SetupPanel } from "@/components/settings/setup-panel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const tabValues = ["mybangs", "configs", "setup", "about"] as const;
type SettingsTab = (typeof tabValues)[number];

function isSettingsTab(value: unknown): value is SettingsTab {
	return tabValues.includes(value as SettingsTab);
}

export const Route = createFileRoute("/settings")({
	validateSearch: (
		search: Record<string, unknown>,
	): { tab?: SettingsTab; bang?: string } => {
		return {
			tab: isSettingsTab(search.tab) ? search.tab : undefined,
			bang: typeof search.bang === "string" ? search.bang : undefined,
		};
	},
	beforeLoad: () => {
		if (localStorage.getItem("cuzbangs-consent") !== "true") {
			throw redirect({ to: "/get-started" });
		}
	},
	component: SettingsPage,
});

const tabs = [
	{
		value: "mybangs",
		label: "My Bangs",
		icon: LibraryBig,
	},
	{
		value: "configs",
		label: "Configs",
		icon: SlidersHorizontal,
	},
	{
		value: "setup",
		label: "Setup",
		icon: Search,
	},
	{
		value: "about",
		label: "About",
		icon: CircleHelp,
	},
] as const;

function SettingsPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { tab, bang } = Route.useSearch();
	const currentTab = tab ?? "mybangs";
	const currentTabDetails = tabs.find((tab) => tab.value === currentTab);

	const setSearch = (nextTab: SettingsTab, nextBang?: string) => {
		navigate({
			search: (prev) => ({
				...prev,
				tab: nextTab === "mybangs" ? undefined : nextTab,
				bang: nextBang,
			}),
			resetScroll: false,
		});
	};

	const handleTabChange = (value: string) => {
		setSearch(isSettingsTab(value) ? value : "mybangs");
	};

	const handleOpenBang = (bangId?: string) => {
		setSearch("mybangs", bangId);
	};

	return (
		<div className="min-h-screen px-4 pb-24 pt-28 sm:px-6 lg:px-8">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-start lg:gap-16">
				<div className="lg:hidden">
					<Tabs
						value={currentTab}
						onValueChange={handleTabChange}
						className="w-full"
					>
						<TabsList className="grid h-auto w-full grid-cols-4 rounded-2xl bg-muted/80 p-1">
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

				<aside className="hidden w-full max-w-56 shrink-0 lg:sticky lg:top-28 lg:block">
					<nav className="space-y-1">
						{tabs.map((tab) => {
							const Icon = tab.icon;

							return (
								<button
									key={tab.value}
									type="button"
									onClick={() => setSearch(tab.value)}
									className={cn(
										"group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors active:scale-[0.98]",
										currentTab === tab.value
											? "bg-primary text-primary-foreground shadow-sm"
											: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
									)}
								>
									<Icon className="size-4 shrink-0" />
									<span className="min-w-0 flex-1 font-medium">
										{tab.label}
									</span>
									<ChevronRight className="size-4 shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5" />
								</button>
							);
						})}
					</nav>
				</aside>

				<div className="min-w-0 flex-1 space-y-6">
					<header>
						<h1 className="text-3xl mt-4 font-semibold tracking-tight sm:text-4xl">
							{currentTabDetails?.label}
						</h1>
					</header>

					{currentTab === "mybangs" && (
						<MyBangsPanel openBangId={bang} onOpenBang={handleOpenBang} />
					)}
					{currentTab === "configs" && <ConfigsPanel />}
					{currentTab === "setup" && <SetupPanel />}
					{currentTab === "about" && <AboutPanel />}
				</div>
			</div>
		</div>
	);
}

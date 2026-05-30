import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import {
	ArrowRight,
	ArrowRightIcon,
	Check,
	Copy,
	Download,
	Github,
	MousePointerClick,
	RouteIcon,
	Search,
	Settings2,
	SlidersHorizontal,
	Store,
	Twitter,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { StoreBangsDisabledAlert } from "@/components/store-bangs-disabled-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { db, SETTING_KEYS } from "@/lib/db";
import { fetchSuggestions, getSuggestionUrl } from "@/lib/engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const { isConsented } = useApp();
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const suggestionRef = useRef<HTMLDivElement>(null);

	const symbolSetting = useLiveQuery(() =>
		db.settings.where("key").equals(SETTING_KEYS.SYMBOL).first(),
	);
	const symbol = (symbolSetting?.value as string) || "!";
	const useStoreBangsSetting = useLiveQuery(() =>
		db.settings.where("key").equals(SETTING_KEYS.USE_STORE).first(),
	);
	const showStoreBangsAlert =
		useStoreBangsSetting !== undefined &&
		useStoreBangsSetting.value !== "true" &&
		useStoreBangsSetting.value !== true;

	const [placeholderIndex, setPlaceholderIndex] = useState(0);
	const [placeholders, setPlaceholders] = useState([
		"yt tutorial masak",
		"gh iydheko",
		"gpt buatin pantun",
	]);

	useEffect(() => {
		fetch("/data/placeholders.json")
			.then((res) => res.json())
			.then(
				(data) => Array.isArray(data) && data.length && setPlaceholders(data),
			)
			.catch(() => {});
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
		}, 3000);
		return () => clearInterval(interval);
	}, [placeholders.length]);

	const currentPlaceholder = `Try \`${symbol}${placeholders[placeholderIndex]}\``;

	useEffect(() => {
		const updateSuggestions = async () => {
			if (!query.trim()) {
				setSuggestions([]);
				return;
			}

			const url = await getSuggestionUrl(query);
			setSuggestions(url ? await fetchSuggestions(url) : []);
		};

		const timeout = setTimeout(updateSuggestions, 100);
		return () => clearTimeout(timeout);
	}, [query]);

	const handleSearch = (e: React.FormEvent | string) => {
		if (typeof e !== "string") e.preventDefault();
		const finalQuery = typeof e === "string" ? e : query;
		if (!finalQuery.trim()) return;
		window.location.href = `/go?q=${encodeURIComponent(finalQuery)}`;
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((prev) => Math.max(prev - 1, -1));
		} else if (e.key === "Enter" && selectedIndex >= 0) {
			e.preventDefault();
			handleSearch(suggestions[selectedIndex]);
		} else if (e.key === "Escape") {
			setShowSuggestions(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col max-w-6xl mx-auto mt-28 px-4 space-y-10 pb-20">
			{isConsented && showStoreBangsAlert && (
				<StoreBangsDisabledAlert className="max-w-5xl" />
			)}

			<section className="relative px-6 py-16 md:p-16 text-center min-h-[31rem] overflow-hidden flex flex-col justify-center border rounded-2xl">
				<div className="absolute inset-0 bg-black bg-[radial-gradient(#1B1B1C_1px,transparent_1px)] [background-size:16px_16px]" />
				<div className="absolute inset-x-0 top-0 mx-auto h-56 max-w-3xl bg-primary/10 blur-3xl" />
				<div className="relative space-y-8">
					<div className="space-y-5">
						<h1 className="text-5xl md:text-7xl font-semibold text-white [letter-spacing:-0.05em]">
							cuzbangs. cuz it bangs
						</h1>
						<p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
							Type <span className="text-white font-mono">!yt lo-fi</span>. Go
							straight there. Pick your own defaults.
						</p>
					</div>

					<div className="flex flex-col items-center gap-4 relative">
						{isConsented ? (
							<>
								<form onSubmit={handleSearch} className="w-full max-w-xl">
									<InputGroup
										size="lg"
										className="w-full relative overflow-hidden"
									>
										{!query && (
											<div className="absolute inset-0 flex items-center pl-13 pointer-events-none z-10">
												<AnimatePresence mode="wait">
													<motion.span
														key={currentPlaceholder}
														initial={{ opacity: 0, filter: "blur(5px)", y: 2 }}
														animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
														exit={{ opacity: 0, filter: "blur(5px)", y: -2 }}
														transition={{ duration: 0.4, ease: "easeInOut" }}
														className="text-muted-foreground text-lg"
													>
														{currentPlaceholder}
													</motion.span>
												</AnimatePresence>
											</div>
										)}
										<InputGroupInput
											value={query}
											onChange={(e) => {
												setQuery(e.target.value);
												setShowSuggestions(true);
												setSelectedIndex(-1);
											}}
											onFocus={() => setShowSuggestions(true)}
											onKeyDown={handleKeyDown}
											onBlur={() =>
												setTimeout(() => setShowSuggestions(false), 200)
											}
										/>
										<InputGroupAddon className="mr-[-8px]">
											<Search className="mb-[1px]" />
										</InputGroupAddon>
										<InputGroupButton
											type="submit"
											variant="default"
											className="rounded-sm mr-2 w-11 h-8"
											size="icon-lg"
										>
											<ArrowRightIcon />
											<span className="sr-only">Send</span>
										</InputGroupButton>
									</InputGroup>
								</form>
								{showSuggestions && suggestions.length > 0 && (
									<div
										ref={suggestionRef}
										className="absolute top-full mt-2 w-full max-w-xl bg-background border rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
									>
										{suggestions.map((suggestion, index) => (
											<button
												key={suggestion}
												type="button"
												className={cn(
													"w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-3",
													index === selectedIndex
														? "bg-accent"
														: "hover:bg-accent/50",
												)}
												onClick={() => handleSearch(suggestion)}
												onMouseEnter={() => setSelectedIndex(index)}
											>
												<Search className="size-3.5 text-muted-foreground" />
												<span>{suggestion}</span>
											</button>
										))}
									</div>
								)}
							</>
						) : (
							<div className="flex gap-2">
								<Button size="lg" asChild>
									<Link to="/get-started">Get Started</Link>
								</Button>
								<Button size="lg" variant="ghost" asChild>
									<Link to="/store">
										View Bangs <ArrowRight />
									</Link>
								</Button>
							</div>
						)}
					</div>
				</div>
			</section>

			<section className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{[
					{ icon: RouteIcon, title: "Redirect", text: "Bang → website" },
					{ icon: Search, title: "Search", text: "Your fallback" },
					{
						icon: SlidersHorizontal,
						title: "Customize",
						text: "Prefix + bangs",
					},
				].map((feature) => (
					<div
						key={feature.title}
						className="rounded-2xl border bg-card/50 p-6"
					>
						<feature.icon className="mb-6 size-8 text-primary" />
						<h2 className="text-xl font-semibold tracking-tight">
							{feature.title}
						</h2>
						<p className="mt-2 text-sm text-muted-foreground">{feature.text}</p>
					</div>
				))}
			</section>

			<section className="rounded-2xl border p-6 md:p-10 space-y-8">
				<div className="space-y-3">
					<Badge variant="outline" className="rounded-full">
						3 pages
					</Badge>
					<h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
						Tiny app. Clear flow.
					</h2>
				</div>
				<div className="grid gap-4 md:grid-cols-3">
					{[
						{
							icon: MousePointerClick,
							name: "Landing",
							items: ["Hero", "Setup", "Search"],
						},
						{ icon: Store, name: "Store", items: ["Bangs", "Search", "FYI"] },
						{
							icon: Settings2,
							name: "Config",
							items: ["Engine", "Prefix", "Custom"],
						},
					].map((section) => (
						<div key={section.name} className="rounded-2xl bg-muted/20 p-5">
							<section.icon className="mb-5 size-7 text-primary" />
							<h3 className="text-xl font-semibold tracking-tight">
								{section.name}
							</h3>
							<div className="mt-4 flex flex-wrap gap-2">
								{section.items.map((item) => (
									<Badge
										key={item}
										variant="secondary"
										className="rounded-full"
									>
										{item}
									</Badge>
								))}
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="relative min-h-[31rem] overflow-hidden rounded-2xl border px-6 py-16 md:p-16 flex flex-col justify-center">
				<div className="absolute inset-0 bg-black bg-[radial-gradient(#1B1B1C_1px,transparent_1px)] [background-size:16px_16px]" />
				<div className="absolute inset-x-0 bottom-0 mx-auto h-56 max-w-3xl bg-primary/10 blur-3xl" />
				<div className="relative grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
					<div className="space-y-5">
						<h2 className="text-4xl md:text-6xl font-semibold text-white [letter-spacing:-0.04em]">
							No sneaky sync.
						</h2>
						<p className="max-w-2xl text-lg text-gray-400 leading-8">
							Consent → download → copy URL. that's it.
						</p>
						<Button size="lg" disabled={isConsented} asChild={!isConsented}>
							{isConsented ? (
								<>
									You're set
									<Download />
								</>
							) : (
								<Link to="/get-started">
									Start setup
									<Download />
								</Link>
							)}
						</Button>
					</div>
					<div className="relative grid grid-cols-2 gap-4 rounded-2xl border bg-background/90 p-5">
						{[
							{ icon: MousePointerClick, step: "Start" },
							{ icon: Check, step: "Consent" },
							{ icon: Download, step: "Download" },
							{ icon: Copy, step: "Copy URL" },
						].map((item) => (
							<div
								key={item.step}
								className="flex min-h-28 flex-col justify-between rounded-xl bg-muted/30 p-4"
							>
								<item.icon className="size-6 text-primary" />
								<span className="text-sm font-medium">{item.step}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			<footer className="flex flex-col gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
				<p>© {new Date().getFullYear()} cuzbangs.</p>
				<div className="flex items-center gap-4">
					<a
						href="https://github.com/iydheko/cuzbangs"
						className="inline-flex items-center gap-2 hover:text-foreground"
					>
						<Github className="size-4" /> GitHub
					</a>
					<a
						href="https://twitter.com/iydheko"
						className="inline-flex items-center gap-2 hover:text-foreground"
					>
						<Twitter className="size-4" /> Twitter
					</a>
				</div>
			</footer>
		</div>
	);
}

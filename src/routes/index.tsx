import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	ArrowRightIcon,
	Check,
	Copy,
	Loader2,
	Search,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { StoreBangsDisabledAlert } from "@/components/store-bangs-disabled-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { syncBangs } from "@/lib/bangs-sync";
import { fetchSuggestions, getSuggestionUrl } from "@/lib/engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: App });

import { useLiveQuery } from "dexie-react-hooks";
import { db, SETTING_KEYS } from "@/lib/db";

function App() {
	const { isConsented, acceptConsent } = useApp();
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [showConsentModal, setShowConsentModal] = useState(false);
	const [downloadState, setDownloadState] = useState<
		"idle" | "downloading" | "finished"
	>("idle");
	const [copiedField, setCopiedField] = useState<string | null>(null);
	const suggestionRef = useRef<HTMLDivElement>(null);

	// Get user's preferred symbol
	const symbolSetting = useLiveQuery(() =>
		db.settings.where("key").equals(SETTING_KEYS.SYMBOL).first(),
	);
	const symbol = (symbolSetting?.value as string) || "!";

	// Check if store bangs is enabled
	const useStoreBangsSetting = useLiveQuery(() =>
		db.settings.where("key").equals(SETTING_KEYS.USE_STORE).first(),
	);
	const showStoreBangsAlert =
		useStoreBangsSetting !== undefined &&
		useStoreBangsSetting.value !== "true" &&
		useStoreBangsSetting.value !== true;

	// Dynamic placeholder logic
	const [placeholderIndex, setPlaceholderIndex] = useState(0);
	const [placeholders, setPlaceholders] = useState<string[]>([
		"yt tutorial masak",
		"gh iydheko",
		"gpt buatin pantun",
	]);

	useEffect(() => {
		fetch("/data/placeholders.json")
			.then((res) => res.json())
			.then((data) => {
				if (Array.isArray(data) && data.length > 0) {
					setPlaceholders(data);
				}
			})
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
			if (url) {
				const fetched = await fetchSuggestions(url);
				setSuggestions(fetched);
			} else {
				setSuggestions([]);
			}
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

	const handleGetStarted = () => {
		setShowConsentModal(true);
		setDownloadState("idle");
	};

	const handleAgree = async () => {
		setDownloadState("downloading");

		// Wait for both the minimum animation time and the actual sync
		await Promise.all([
			new Promise((resolve) => setTimeout(resolve, 2000)),
			syncBangs({ force: true }),
		]);

		setDownloadState("finished");
		acceptConsent();
	};

	const handleCloseConfig = () => {
		setShowConsentModal(false);
		navigate({ to: "/settings" });
	};

	const copyToClipboard = (text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	};

	return (
		<div className="min-h-screen flex flex-col max-w-5xl mx-auto mt-32 px-4 space-y-8">
			{isConsented && showStoreBangsAlert && (
				<StoreBangsDisabledAlert className="max-w-5xl" />
			)}
			<section className="relative p-16 text-center h-[25rem] overflow-hidden flex flex-col justify-center border rounded-xl">
				<div className="absolute inset-0 w-full h-full bg-black bg-[radial-gradient(#1B1B1C_1px,transparent_1px)] [background-size:16px_16px]" />
				<div className="relative space-y-8">
					<div className="space-y-4">
						<h1 className="text-4xl md:text-6xl font-semibold text-white [letter-spacing:-0.03em]">
							cuzbangs. cuz it bangs
						</h1>
						<p className="text-lg text-gray-400 max-w-3xl mx-auto">
							A redirect engine with cuztomizable bangs.
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
											placeholder=""
											value={query}
											onChange={(e) => {
												setQuery(e.target.value);
												setShowSuggestions(true);
												setSelectedIndex(-1);
											}}
											onFocus={() => setShowSuggestions(true)}
											onKeyDown={handleKeyDown}
											onBlur={() => {
												// Small delay to allow clicking suggestions
												setTimeout(() => setShowSuggestions(false), 200);
											}}
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
								<Button size="lg" onClick={handleGetStarted}>
									Get Started
								</Button>
								<Button
									size="lg"
									variant="ghost"
									className="cursor-default"
									asChild
								>
									<Link to="/store">
										View Bangs List <ArrowRight />
									</Link>
								</Button>
							</div>
						)}
					</div>
				</div>
			</section>
			<section className="grid grid-cols-1 md:grid-cols-2 gap-12 py-16 items-center">
				<div className="space-y-6">
					<h2 className="text-4xl font-semibold text-white tracking-tight">
						Precision Navigation
					</h2>
					<p className="text-lg text-muted-foreground leading-relaxed">
						Stop scrolling through search results. Go directly to
						<span className="text-primary font-medium"> YouTube</span>,
						<span className="text-blue-400 font-medium"> GitHub</span>, or your
						own <span className="text-green-400 font-medium">custom tools</span>{" "}
						with a single command.
					</p>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary" className="px-3 py-1 text-xs">
							yt math
						</Badge>
						<Badge variant="secondary" className="px-3 py-1 text-xs">
							gh cuzbangs
						</Badge>
						<Badge variant="secondary" className="px-3 py-1 text-xs">
							gpt fix my code
						</Badge>
					</div>
				</div>
				<div className="relative group">
					<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
					<div className="relative p-8 bg-background border rounded-xl space-y-4">
						<div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
							<div className="size-2 rounded-full bg-green-500 animate-pulse" />
							Live Engine Status: Ready
						</div>
						<div className="space-y-3">
							{[
								{ t: "yt", d: "YouTube Search" },
								{ t: "gh", d: "GitHub Repository" },
								{ t: "gpt", d: "ChatGPT Query" },
							].map((b) => (
								<div
									key={b.t}
									className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border hover:bg-muted/50 transition-all cursor-default"
								>
									<span className="font-mono text-primary">{b.t}</span>
									<span className="text-xs text-muted-foreground">{b.d}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<Dialog
				open={showConsentModal}
				onOpenChange={(open) => {
					if (downloadState === "downloading") return;
					setShowConsentModal(open);
				}}
			>
				<DialogContent
					className="sm:max-w-md"
					disableClose={downloadState === "downloading"}
					showCloseButton={downloadState !== "downloading"}
				>
					<DialogHeader>
						<DialogTitle>
							{downloadState === "finished"
								? "You're almost done!"
								: downloadState === "downloading"
									? ""
									: "Get Started"}
						</DialogTitle>
						<DialogDescription>
							{downloadState === "finished"
								? "Set cuzbangs as default search engine on your browser."
								: downloadState === "downloading"
									? ""
									: "To ensure cuzbangs works fast and respects your privacy, you need to read:"}
						</DialogDescription>
					</DialogHeader>

					{downloadState === "idle" && (
						<>
							<div>
								<ul className="mb-2 ml-6 list-disc [&>li]:mb-2">
									<li>
										We will download bangs data and store them on your local
										device.
									</li>
									<li>
										We do not collect any personal data; cause i don't need to
										know you.
									</li>
									<li>
										We probably track your history searches; for sorting the
										bangs popularity on store; you can disable it tho
									</li>
									<li>Redirects works even in offline.</li>
									<li>An internet is required to sync bangs data.</li>
									<li>
										If you want, you can submit a pull request to add websites
										to the store.
									</li>
								</ul>
							</div>
							<p className="text-xs text-muted-foreground">
								By clicking "I Agree", I assume you read already and we will
								download bangs and store it on your local device.
							</p>
							<DialogFooter className="grid grid-cols-2 gap-2">
								<Button
									variant="outline"
									onClick={() => setShowConsentModal(false)}
								>
									Cancel
								</Button>
								<Button onClick={handleAgree}>I Agree</Button>
							</DialogFooter>
						</>
					)}

					{downloadState === "downloading" && (
						<div className="flex flex-col items-center justify-center py-12 space-y-4">
							<Loader2 className="h-12 w-12 animate-spin text-primary" />
							<p className="text-lg font-medium animate-pulse">
								Downloading bangs...
							</p>
						</div>
					)}

					{downloadState === "finished" && (
						<div>
							<div className="space-y-6">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label>Search URL</Label>
										<div className="flex items-center space-x-2">
											<div className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
												https://cuzbangs.iydheko.site/go?q=%s
											</div>
											<Button
												size="icon"
												variant="outline"
												onClick={() =>
													copyToClipboard(
														"https://cuzbangs.iydheko.site/go?q=%s",
														"search",
													)
												}
											>
												{copiedField === "search" ? (
													<Check className="h-4 w-4 text-green-500" />
												) : (
													<Copy className="h-4 w-4" />
												)}
											</Button>
										</div>
									</div>

									<div className="space-y-2">
										<Label>Suggestion URL</Label>
										<div className="flex items-center space-x-2">
											<div className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
												https://cuzbangs.iydheko.site/suggestions?q=%s
											</div>
											<Button
												size="icon"
												variant="outline"
												onClick={() =>
													copyToClipboard(
														"https://cuzbangs.iydheko.site/suggestions?q=%s",
														"suggest",
													)
												}
											>
												{copiedField === "suggest" ? (
													<Check className="h-4 w-4 text-green-500" />
												) : (
													<Copy className="h-4 w-4" />
												)}
											</Button>
										</div>
									</div>
								</div>
								<p className="text-xs text-muted-foreground">
									You can visit about settings page to see this again.
								</p>

								<DialogFooter>
									<Button onClick={handleCloseConfig} className="w-full">
										Close
									</Button>
								</DialogFooter>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

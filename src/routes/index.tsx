import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowRightIcon, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/providers/app-provider";
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
import { fetchSuggestions, getSuggestionUrl } from "@/lib/engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const { isConsented, acceptConsent } = useApp();
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [showConsentModal, setShowConsentModal] = useState(false);
	const suggestionRef = useRef<HTMLDivElement>(null);

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
	};

	const handleAgree = () => {
		acceptConsent();
		setShowConsentModal(false);
		navigate({ to: "/settings" });
	};

	return (
		<div className="min-h-screen flex flex-col max-w-5xl mx-auto mt-32 px-4 space-y-8">
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
									<InputGroup size="lg" className="w-full">
										<InputGroupInput
											placeholder="Try `!c hey, chatgpt`"
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

			<Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Get Started</DialogTitle>
						<DialogDescription>
							To ensure cuzbangs works fast and respects your privacy, you need
							to read:
						</DialogDescription>
					</DialogHeader>
					<div>
						<ul className="mb-2 ml-6 list-disc [&>li]:mb-2">
							<li>
								We will download bangs data and store them on your local device.
							</li>
							<li>
								We do not track your history searches; cause i don't want your
								data.
							</li>
							<li>
								We do not collect any personal data; cause i don't need to know
								you.
							</li>
							<li>Redirects works even in offline.</li>
							<li>An internet is required to sync bangs data.</li>
							<li>
								If you want, you can submit a pull request to add websites to
								the store.
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
				</DialogContent>
			</Dialog>
		</div>
	);
}

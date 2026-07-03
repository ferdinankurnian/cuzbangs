import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BangDetailsDialogContent } from "@/components/bang-details-dialog";
import { useApp } from "@/components/providers/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Item, ItemGroup } from "@/components/ui/item";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	bangHasTrigger,
	getPrimaryTrigger,
	normalizeBangTriggers,
	normalizeTrigger,
} from "@/lib/bangs";
import { type BangEntry, db } from "@/lib/db";
import { fetchStoreBangs } from "@/lib/store-bangs";
import { cn } from "@/lib/utils";

const BATCH_SIZE = 30;

type SearchMode = "all" | "title" | "trigger";

const searchModes: { value: SearchMode; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "title", label: "Title" },
	{ value: "trigger", label: "Trigger" },
];

async function fetchFallbackBangs(): Promise<BangEntry[]> {
	try {
		return await fetchStoreBangs();
	} catch (err) {
		console.error("Fallback fetch failed:", err);
		return [];
	}
}

function bangMatchesSearch(bang: BangEntry, query: string, mode: SearchMode) {
	if (!query) return true;

	const title = bang.s.toLowerCase();
	const triggers = normalizeBangTriggers(bang.t);

	if (mode === "title") return title.includes(query);
	if (mode === "trigger") {
		return triggers.some((trigger) => trigger.includes(query));
	}

	return (
		title.includes(query) ||
		bang.d.toLowerCase().includes(query) ||
		triggers.some((trigger) => trigger.includes(query))
	);
}

function getBangSearchScore(bang: BangEntry, query: string) {
	if (!query) return 0;

	const title = bang.s.toLowerCase();
	const domain = bang.d.toLowerCase();
	const triggers = normalizeBangTriggers(bang.t);
	const primaryTrigger = getPrimaryTrigger(bang);
	let score = 0;

	if (title === query) score += 1000;
	if (primaryTrigger === query) score += 950;
	if (triggers.some((trigger) => trigger === query)) score += 900;
	if (domain === query || domain === `www.${query}.com`) score += 850;
	if (title.startsWith(query)) score += 700;
	if (primaryTrigger.startsWith(query)) score += 650;
	if (triggers.some((trigger) => trigger.startsWith(query))) score += 600;
	if (domain.startsWith(query) || domain.startsWith(`www.${query}`))
		score += 550;
	if (title.includes(query)) score += 300;
	if (domain.includes(query)) score += 250;
	if (triggers.some((trigger) => trigger.includes(query))) score += 200;

	return score;
}

function sortBangs(bangs: BangEntry[], query: string) {
	return [...bangs].sort((a, b) => {
		if (query) {
			const scoreDiff =
				getBangSearchScore(b, query) - getBangSearchScore(a, query);
			if (scoreDiff !== 0) return scoreDiff;
		}

		return a.s.localeCompare(b.s);
	});
}

export const Route = createFileRoute("/store")({
	validateSearch: (
		search: Record<string, unknown>,
	): { bang?: string; category?: string; sort?: "name" } => {
		return {
			bang: search.bang as string | undefined,
			category: (search.category as string) || "all",
			sort: (search.sort as "name") || "name",
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { isConsented } = useApp();
	const {
		bang: openBangTrigger,
		category: selectedCategory = "all",
		sort: selectedSort = "name",
	} = Route.useSearch();
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [searchMode, setSearchMode] = useState<SearchMode>("all");
	const [offset, setOffset] = useState(BATCH_SIZE);
	const [allBangs, setAllBangs] = useState<BangEntry[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const userBangs = useLiveQuery(() => db.userBangs.toArray()) || [];
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const isSearching = debouncedQuery.trim().length > 0;
	const resultsLabel = `"${debouncedQuery.trim()}" Results`;

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(searchQuery);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	const { data: categories } = useQuery({
		queryKey: ["storeCategories"],
		queryFn: async () => {
			let keys = await db.storeBangs.orderBy("c").uniqueKeys();
			if (keys.length === 0) {
				const fallback = await fetchFallbackBangs();
				keys = [...new Set(fallback.map((b) => b.c))].filter(
					Boolean,
				) as string[];
			}
			return ["all", ...keys.filter((c) => c && c !== "all")] as string[];
		},
	});

	const { data: activeBang, isLoading: isActiveBangLoading } = useQuery({
		queryKey: ["storeBang", openBangTrigger],
		queryFn: async () => {
			if (!openBangTrigger) return null;
			const normalizedTrigger = normalizeTrigger(openBangTrigger);
			const fromDb = await db.storeBangs
				.where("t")
				.equals(normalizedTrigger)
				.first();
			if (fromDb) return fromDb;

			// Fallback to fetch from JSON
			const fallback = await fetchFallbackBangs();
			return (
				fallback.find((b) => bangHasTrigger(b, normalizedTrigger)) ||
				fallback.find((b) => b.s.toLowerCase() === normalizedTrigger) ||
				null
			);
		},
		enabled: !!openBangTrigger,
	});

	const handleOpenBang = (trigger: string) => {
		navigate({
			search: (prev) => ({ ...prev, bang: trigger }),
			resetScroll: false,
		});
	};

	const handleCloseBang = () => {
		navigate({
			search: (prev) => ({ ...prev, bang: undefined }),
			resetScroll: false,
		});
	};

	const handleCategoryChange = (cat: string) => {
		navigate({
			search: (prev) => ({ ...prev, category: cat }),
			resetScroll: false,
		});
	};

	const activeOverride = useMemo(() => {
		if (!activeBang) return null;

		const storeTriggers = new Set(normalizeBangTriggers(activeBang.t));
		return (
			userBangs.find((bang) =>
				normalizeBangTriggers(bang.t).some((trigger) =>
					storeTriggers.has(trigger),
				),
			) ?? null
		);
	}, [activeBang, userBangs]);

	const resetActiveOverride = async () => {
		if (!activeBang || activeOverride?.id === undefined) return;

		const storeTriggers = new Set(normalizeBangTriggers(activeBang.t));
		const remainingTriggers = normalizeBangTriggers(activeOverride.t).filter(
			(trigger) => !storeTriggers.has(trigger),
		);

		if (remainingTriggers.length === 0) {
			await db.userBangs.delete(activeOverride.id);
			return;
		}

		await db.userBangs.update(activeOverride.id, {
			t: remainingTriggers,
			s: remainingTriggers[0],
		});
	};

	const { data: initialBangs, isFetching } = useQuery({
		queryKey: [
			"storeBangs",
			debouncedQuery,
			searchMode,
			selectedCategory,
			selectedSort,
			"initial",
		],
		queryFn: async () => {
			const query = debouncedQuery.trim().toLowerCase();
			const dbCount = await db.storeBangs.count();

			if (dbCount === 0) {
				const fallback = await fetchFallbackBangs();
				let filtered = fallback;

				if (selectedCategory !== "all") {
					filtered = filtered.filter((b) => b.c === selectedCategory);
				}

				if (query) {
					filtered = filtered.filter((bang) =>
						bangMatchesSearch(bang, query, searchMode),
					);
				}

				return sortBangs(filtered, query).slice(0, BATCH_SIZE);
			}

			if (selectedCategory === "all" && query) {
				const results = await db.storeBangs
					.filter((bang) => bangMatchesSearch(bang, query, searchMode))
					.toArray();

				return sortBangs(results, query).slice(0, BATCH_SIZE);
			}

			if (selectedCategory === "all") {
				return await db.storeBangs.orderBy("s").limit(BATCH_SIZE).toArray();
			}

			const collection = db.storeBangs.where("c").equals(selectedCategory);
			if (query) {
				const results = await collection
					.filter((bang) => bangMatchesSearch(bang, query, searchMode))
					.toArray();

				return sortBangs(results, query).slice(0, BATCH_SIZE);
			}

			const results = await collection.sortBy("s");
			return results.slice(0, BATCH_SIZE);
		},
	});

	useEffect(() => {
		if (debouncedQuery !== searchQuery) {
			// Query is stale or pending debounce
			return;
		}
		if (!initialBangs) return;

		setAllBangs(initialBangs);
		setOffset(BATCH_SIZE);
		setHasMore(true);
	}, [initialBangs, debouncedQuery, searchQuery]);

	const loadMore = useCallback(async () => {
		if (isLoadingMore || !hasMore || isFetching) return;

		setIsLoadingMore(true);
		try {
			const query = searchQuery.trim().toLowerCase();
			const dbCount = await db.storeBangs.count();

			if (dbCount === 0) {
				const fallback = await fetchFallbackBangs();
				let filtered = fallback;

				if (selectedCategory !== "all") {
					filtered = filtered.filter((b) => b.c === selectedCategory);
				}

				if (query) {
					filtered = filtered.filter((bang) =>
						bangMatchesSearch(bang, query, searchMode),
					);
				}

				filtered = sortBangs(filtered, query);

				const nextBangs = filtered.slice(offset, offset + BATCH_SIZE);
				if (nextBangs.length < BATCH_SIZE) setHasMore(false);
				setAllBangs((prev) => [...prev, ...nextBangs]);
				setOffset((prev) => prev + BATCH_SIZE);
				return;
			}

			let newBangs: BangEntry[];

			if (selectedCategory === "all") {
				if (query) {
					const results = await db.storeBangs
						.filter((bang) => bangMatchesSearch(bang, query, searchMode))
						.toArray();

					newBangs = sortBangs(results, query).slice(
						offset,
						offset + BATCH_SIZE,
					);
				} else {
					const collection = db.storeBangs.orderBy("s");
					newBangs = await collection
						.offset(offset)
						.limit(BATCH_SIZE)
						.toArray();
				}
			} else {
				const collection = db.storeBangs.where("c").equals(selectedCategory);
				const results = await (query
					? collection
							.filter((bang) => bangMatchesSearch(bang, query, searchMode))
							.toArray()
					: collection.toArray());

				newBangs = sortBangs(results, query).slice(offset, offset + BATCH_SIZE);
			}

			if (newBangs.length < BATCH_SIZE) {
				setHasMore(false);
			}

			setAllBangs((prev) => [...prev, ...newBangs]);
			setOffset((prev) => prev + BATCH_SIZE);
		} finally {
			setIsLoadingMore(false);
		}
	}, [
		isLoadingMore,
		hasMore,
		isFetching,
		searchQuery,
		searchMode,
		offset,
		selectedCategory,
	]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0].isIntersecting &&
					hasMore &&
					!isLoadingMore &&
					!isFetching
				) {
					loadMore();
				}
			},
			{ rootMargin: "200px" },
		);

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}

		return () => observer.disconnect();
	}, [loadMore, hasMore, isLoadingMore, isFetching]);

	return (
		<div className="min-h-screen flex flex-col max-w-6xl mx-auto mt-32 space-y-16 px-4 pb-24">
			<section className="text-center overflow-hidden space-y-8">
				<div className="flex flex-col items-center gap-8">
					<div className="flex flex-col items-center gap-2">
						<h1 className="text-4xl font-semibold text-white">Store</h1>
						<p className="text-lg text-primary/50">
							10.000++ ways to skip straight to what you need.
						</p>
					</div>

					<div className="flex flex-col items-center gap-6 w-full max-w-2xl">
						<InputGroup size="lg" className="w-full">
							<InputGroupAddon>
								<Search className="mb-[1px]" />
							</InputGroupAddon>
							<InputGroupInput
								placeholder="Search for bangs..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<InputGroupAddon align="inline-end" className="pr-1">
								<Select
									value={searchMode}
									onValueChange={(value) => setSearchMode(value as SearchMode)}
								>
									<SelectTrigger
										size="sm"
										className="h-8 border-0 bg-secondary/70 px-2 text-xs shadow-none hover:bg-secondary"
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent align="end">
										{searchModes.map((mode) => (
											<SelectItem key={mode.value} value={mode.value}>
												{mode.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</InputGroupAddon>
						</InputGroup>

						<div className="flex flex-wrap items-center justify-center gap-2">
							{categories?.map((cat) => (
								<Badge
									key={cat}
									variant={selectedCategory === cat ? "default" : "outline"}
									className={cn(
										"cursor-default px-4 py-1.5 text-sm transition-all active:scale-95 capitalize",
										isSearching &&
											cat === "all" &&
											"max-w-48 truncate normal-case",
										selectedCategory !== cat && "hover:bg-secondary/80",
									)}
									onClick={() => handleCategoryChange(cat)}
								>
									{isSearching && cat === "all" ? resultsLabel : cat}
								</Badge>
							))}
						</div>
					</div>
				</div>

				<ItemGroup
					className={cn(
						"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity",
						(isFetching || searchQuery !== debouncedQuery) &&
							"opacity-50 pointer-events-none",
					)}
				>
					{allBangs.map((bang) => {
						const triggers = normalizeBangTriggers(bang.t);
						const primaryTrigger = getPrimaryTrigger(bang);
						const visibleTriggers = triggers.slice(0, 3);
						const hiddenTriggerCount = triggers.length - visibleTriggers.length;
						const favicon = `https://www.google.com/s2/favicons?sz=128&domain=${bang.d}`;

						return (
							<Item
								key={bang.id}
								variant="outline"
								className="hover:bg-secondary/50 active:scale-[0.99] transition-[background-color,scale] outline-0 p-3 min-h-20 flex-row flex-nowrap items-start text-left gap-3 rounded-xl overflow-hidden"
								onClick={() => handleOpenBang(primaryTrigger)}
							>
								<div className="size-8 shrink-0 overflow-hidden rounded-[3px] flex items-start justify-start">
									<img
										src={favicon}
										alt={bang.s}
										className="size-8 object-contain rounded-[4px]"
										onError={(e) => {
											(e.target as HTMLImageElement).src =
												`https://ui-avatars.com/api/?name=${encodeURIComponent(bang.s)}&background=random`;
										}}
									/>
								</div>
								<div className="flex min-w-0 flex-1 flex-col items-start gap-1 overflow-hidden">
									<div className="min-w-0 w-full">
										<h1 className="font-medium text-sm leading-tight truncate w-full">
											{bang.s}
										</h1>
										<p className="text-xs text-muted-foreground truncate w-full">
											{bang.d}
										</p>
									</div>
									<div className="flex max-w-full flex-wrap gap-1">
										{visibleTriggers.map((trigger) => (
											<Badge
												key={trigger}
												variant="secondary"
												className="max-w-24 truncate px-1 py-0 font-mono text-[10px] leading-3"
											>
												{trigger}
											</Badge>
										))}
										{hiddenTriggerCount > 0 && (
											<Badge
												variant="outline"
												className="px-1 py-0 font-mono text-[10px] leading-3 text-muted-foreground"
											>
												+{hiddenTriggerCount}
											</Badge>
										)}
									</div>
								</div>
							</Item>
						);
					})}

					{allBangs.length === 0 && !isFetching && (
						<div className="col-span-full">
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant="icon" className="size-12">
										<Search />
									</EmptyMedia>
									<EmptyTitle>No bangs found</EmptyTitle>
									<EmptyDescription>
										{searchQuery ? (
											<>
												We couldn't find any bangs matching "{searchQuery}"
												{selectedCategory !== "all" && (
													<> in the {selectedCategory} category</>
												)}
												.
											</>
										) : (
											<>No bangs found in the {selectedCategory} category.</>
										)}
									</EmptyDescription>
								</EmptyHeader>
								<div className="flex flex-row gap-2">
									{searchQuery && (
										<Button
											variant="outline"
											onClick={() => setSearchQuery("")}
										>
											Clear search
										</Button>
									)}
									{selectedCategory !== "all" && (
										<Button
											variant="outline"
											onClick={() => handleCategoryChange("all")}
										>
											{isSearching ? "Show results" : "Show all categories"}
										</Button>
									)}
								</div>
							</Empty>
						</div>
					)}
				</ItemGroup>

				<div ref={loadMoreRef} className="min-h-20">
					{(isLoadingMore || (!hasMore && allBangs.length > 0)) && (
						<div className="px-4 py-3 text-center text-xs text-muted-foreground">
							{isLoadingMore && "Loading more..."}
							{!hasMore && allBangs.length > 0 && "You've reached the end"}
						</div>
					)}
				</div>
			</section>

			<Dialog
				open={!!openBangTrigger}
				onOpenChange={(open) => {
					if (!open) handleCloseBang();
				}}
			>
				<BangDetailsDialogContent
					mode="store"
					isModified={!!activeOverride}
					isLoading={isActiveBangLoading}
					bang={
						activeBang
							? {
						name: activeBang.s,
						trigger: getPrimaryTrigger(activeBang),
						triggers: activeBang.t,
						url: activeBang.u,
						domain: activeBang.d,
						image: `https://www.google.com/s2/favicons?sz=128&domain=${activeBang.d}`,
						presetSource: activeBang.presetSource,
						subroutes: activeBang.sr?.map((subroute) => ({
							name: subroute.s,
							triggers: subroute.t,
							url: subroute.u,
							baseUrl: subroute.b,
						})),
								}
							: { name: "", trigger: "", url: "", image: "" }
					}
					onOpenSettings={() => {
						if (!isConsented) {
							navigate({ to: "/get-started" });
							return;
						}
						navigate({
							to: "/settings",
							search: {
								bang: activeOverride
									? getPrimaryTrigger(activeOverride)
									: openBangTrigger,
							},
						});
					}}
					onCustomize={async () => {
						if (!activeBang) return;
						if (!isConsented) {
							navigate({ to: "/get-started" });
							return;
						}
						const primaryTrigger = getPrimaryTrigger(activeBang);

						if (activeOverride) {
							navigate({
								to: "/settings",
								search: { bang: getPrimaryTrigger(activeOverride) },
							});
							return;
						}

					const newId = await db.userBangs.add({
						t: normalizeBangTriggers(activeBang.t),
						s: activeBang.s,
						u: activeBang.u,
						d: activeBang.d,
						c: activeBang.c,
						sc: activeBang.sc,
						su: activeBang.su,
						desc: activeBang.desc,
						sr: activeBang.sr,
						isCustom: true,
					});

						navigate({
							to: "/settings",
							search: { bang: primaryTrigger || `new-${newId}` },
						});
					}}
					onResetStoreOverride={resetActiveOverride}
					onDeleteMainBang={() => {}}
				/>
			</Dialog>
		</div>
	);
}

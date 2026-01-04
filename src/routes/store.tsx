import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDownAZ, Filter, Flame, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { BangDetailsDialogContent } from "@/components/bang-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { syncBangs } from "@/lib/bangs-sync";
import { type BangEntry, BangEntrySchema, db } from "@/lib/db";
import { cn } from "@/lib/utils";

const BATCH_SIZE = 30;
const DATA_URL = "/data/bangs.json";

async function fetchFallbackBangs(): Promise<BangEntry[]> {
	try {
		const response = await fetch(DATA_URL);
		if (!response.ok) return [];
		const rawData = await response.json();
		return z.array(BangEntrySchema).parse(rawData);
	} catch (err) {
		console.error("Fallback fetch failed:", err);
		return [];
	}
}

export const Route = createFileRoute("/store")({
	validateSearch: (
		search: Record<string, unknown>,
	): { bang?: string; category?: string; sort?: "popularity" | "name" } => {
		return {
			bang: search.bang as string | undefined,
			category: (search.category as string) || "all",
			sort: (search.sort as "popularity" | "name") || "popularity",
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate({ from: Route.fullPath });
	const {
		bang: openBangTrigger,
		category: selectedCategory = "all",
		sort: selectedSort = "popularity",
	} = Route.useSearch();
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [offset, setOffset] = useState(BATCH_SIZE);
	const [allBangs, setAllBangs] = useState<BangEntry[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const loadMoreRef = useRef<HTMLDivElement>(null);

	// Trigger popularity sync when on store page
	useEffect(() => {
		syncBangs({ popularity: true });
	}, []);

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
			const fromDb = await db.storeBangs
				.where("t")
				.equals(openBangTrigger)
				.first();
			if (fromDb) return fromDb;

			// Fallback to fetch from JSON
			const fallback = await fetchFallbackBangs();
			return (
				fallback.find((b) => b.t.includes(openBangTrigger)) ||
				fallback.find(
					(b) => b.s.toLowerCase() === openBangTrigger.toLowerCase(),
				) ||
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
	const handleSortChange = (sort: "popularity" | "name") => {
		navigate({
			search: (prev) => ({ ...prev, sort }),
			resetScroll: false,
		});
	};

	const { data: initialBangs, isLoading } = useQuery({
		queryKey: [
			"storeBangs",
			debouncedQuery,
			selectedCategory,
			selectedSort,
			"initial",
		],
		queryFn: async () => {
			const query = debouncedQuery.toLowerCase();
			const dbCount = await db.storeBangs.count();

			if (dbCount === 0) {
				const fallback = await fetchFallbackBangs();
				let filtered = fallback;

				if (selectedCategory !== "all") {
					filtered = filtered.filter((b) => b.c === selectedCategory);
				}

				if (query) {
					filtered = filtered.filter(
						(bang) =>
							bang.t.some((t) => t.toLowerCase().includes(query)) ||
							bang.s.toLowerCase().includes(query),
					);
				}

				filtered.sort((a, b) => {
					if (selectedSort === "popularity") return (b.r || 0) - (a.r || 0);
					return a.s.localeCompare(b.s);
				});

				return filtered.slice(0, BATCH_SIZE);
			}

			const sortField = selectedSort === "popularity" ? "r" : "s";

			if (selectedCategory === "all") {
				const collection = db.storeBangs.orderBy(sortField);
				if (selectedSort === "popularity") collection.reverse();

				if (query) {
					return await collection
						.filter(
							(bang) =>
								bang.t.some((t) => t.toLowerCase().includes(query)) ||
								bang.s.toLowerCase().includes(query),
						)
						.limit(BATCH_SIZE)
						.toArray();
				}
				return await collection.limit(BATCH_SIZE).toArray();
			}

			// Category filter
			const collection = db.storeBangs.where("c").equals(selectedCategory);
			if (query) {
				const results = await collection
					.filter(
						(bang) =>
							bang.t.some((t) => t.toLowerCase().includes(query)) ||
							bang.s.toLowerCase().includes(query),
					)
					.toArray();

				return results
					.sort((a, b) => {
						if (selectedSort === "popularity") return (b.r || 0) - (a.r || 0);
						return a.s.localeCompare(b.s);
					})
					.slice(0, BATCH_SIZE);
			}

			const results = await collection.sortBy(sortField);
			if (selectedSort === "popularity") results.reverse();
			return results.slice(0, BATCH_SIZE);
		},
	});

	useEffect(() => {
		if (debouncedQuery !== searchQuery) {
			// Query is stale or pending debounce
			return;
		}
		setAllBangs(initialBangs || []);
		setOffset(BATCH_SIZE);
		setHasMore(true);
	}, [initialBangs, debouncedQuery, searchQuery]);

	const loadMore = useCallback(async () => {
		if (isLoadingMore || !hasMore || isLoading) return;

		setIsLoadingMore(true);
		try {
			const query = searchQuery.toLowerCase();
			const dbCount = await db.storeBangs.count();

			if (dbCount === 0) {
				const fallback = await fetchFallbackBangs();
				let filtered = fallback;

				if (selectedCategory !== "all") {
					filtered = filtered.filter((b) => b.c === selectedCategory);
				}

				if (query) {
					filtered = filtered.filter(
						(bang) =>
							bang.t.some((t) => t.toLowerCase().includes(query)) ||
							bang.s.toLowerCase().includes(query),
					);
				}

				filtered.sort((a, b) => {
					if (selectedSort === "popularity") return (b.r || 0) - (a.r || 0);
					return a.s.localeCompare(b.s);
				});

				const nextBangs = filtered.slice(offset, offset + BATCH_SIZE);
				if (nextBangs.length < BATCH_SIZE) setHasMore(false);
				setAllBangs((prev) => [...prev, ...nextBangs]);
				setOffset((prev) => prev + BATCH_SIZE);
				return;
			}

			const sortField = selectedSort === "popularity" ? "r" : "s";
			let newBangs: BangEntry[];

			if (selectedCategory === "all") {
				const collection = db.storeBangs.orderBy(sortField);
				if (selectedSort === "popularity") collection.reverse();

				if (query) {
					newBangs = await collection
						.filter(
							(bang) =>
								bang.t.some((t) => t.toLowerCase().includes(query)) ||
								bang.s.toLowerCase().includes(query),
						)
						.offset(offset)
						.limit(BATCH_SIZE)
						.toArray();
				} else {
					newBangs = await collection
						.offset(offset)
						.limit(BATCH_SIZE)
						.toArray();
				}
			} else {
				// Category filter
				const collection = db.storeBangs.where("c").equals(selectedCategory);
				const results = await (query
					? collection
							.filter(
								(bang) =>
									bang.t.some((t) => t.toLowerCase().includes(query)) ||
									bang.s.toLowerCase().includes(query),
							)
							.toArray()
					: collection.toArray());

				newBangs = results
					.sort((a, b) => {
						if (selectedSort === "popularity") return (b.r || 0) - (a.r || 0);
						return a.s.localeCompare(b.s);
					})
					.slice(offset, offset + BATCH_SIZE);
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
		isLoading,
		searchQuery,
		offset,
		selectedCategory,
		selectedSort,
	]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0].isIntersecting &&
					hasMore &&
					!isLoadingMore &&
					!isLoading
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
	}, [loadMore, hasMore, isLoadingMore, isLoading]);

	return (
		<div className="min-h-screen flex flex-col max-w-5xl mx-auto mt-32 space-y-16 px-4 pb-24">
			<section className="text-center overflow-hidden space-y-8">
				<div className="flex flex-col items-center gap-8">
					<div className="flex flex-col items-center gap-2">
						<h1 className="text-4xl font-semibold text-white">Store</h1>
						<p className="text-lg text-primary/50">
							List all community bangs. You can submit yours too.
						</p>
					</div>

					<div className="flex flex-col items-center gap-6 w-full max-w-2xl">
						<InputGroup size="lg" className="w-full">
							<InputGroupInput
								placeholder="Search for bangs..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<InputGroupAddon className="mr-[-8px]">
								<Search className="mb-[1px]" />
							</InputGroupAddon>
						</InputGroup>

						<div className="flex flex-wrap items-center justify-center gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Badge
										variant="secondary"
										className="cursor-pointer px-3 py-3 transition-all active:scale-95 hover:bg-secondary/80"
									>
										<Filter />
									</Badge>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start" className="w-40">
									<DropdownMenuRadioGroup
										value={selectedSort}
										onValueChange={(v) =>
											handleSortChange(v as "popularity" | "name")
										}
									>
										<DropdownMenuRadioItem value="popularity">
											<Flame className="size-3.5 mr-2 text-orange-500" />
											Popularity
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="name">
											<ArrowDownAZ className="size-3.5 mr-2 text-blue-500" />
											A-Z
										</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuContent>
							</DropdownMenu>

							{categories?.map((cat) => (
								<Badge
									key={cat}
									variant={selectedCategory === cat ? "default" : "outline"}
									className={cn(
										"cursor-pointer px-4 py-1.5 text-sm transition-all active:scale-95 capitalize",
										selectedCategory !== cat && "hover:bg-secondary/80",
									)}
									onClick={() => handleCategoryChange(cat)}
								>
									{cat}
								</Badge>
							))}
						</div>
					</div>
				</div>

				<ItemGroup
					className={cn(
						"grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 transition-opacity",
						(isLoading || searchQuery !== debouncedQuery) &&
							"opacity-50 pointer-events-none",
					)}
				>
					{allBangs.map((bang) => {
						const primaryTrigger = bang.t[0];
						const favicon = `https://www.google.com/s2/favicons?sz=128&domain=${bang.d}`;

						return (
							<Item
								key={bang.id}
								variant="outline"
								className="hover:bg-secondary/50 active:scale-95 transition-all outline-0 cursor-default p-4 h-full flex flex-col items-center text-center gap-2"
								onClick={() => handleOpenBang(primaryTrigger)}
							>
								<div className="size-16 shrink-0 overflow-hidden rounded-sm bg-muted/50 flex items-center justify-center">
									<img
										src={favicon}
										alt={bang.s}
										className="size-full object-contain p-1 rounded-sm"
										onError={(e) => {
											(e.target as HTMLImageElement).src =
												`https://ui-avatars.com/api/?name=${encodeURIComponent(bang.s)}&background=random`;
										}}
									/>
								</div>
								<div className="flex flex-col flex-1 min-w-0 items-center w-full">
									<h1 className="font-semibold text-sm truncate w-full text-center">
										{bang.s}
									</h1>
									<p className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
										{primaryTrigger}
									</p>
								</div>
							</Item>
						);
					})}

					{allBangs.length === 0 && !isLoading && (
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
											Show all categories
										</Button>
									)}
								</div>
							</Empty>
						</div>
					)}
				</ItemGroup>

				<div
					ref={loadMoreRef}
					className="py-4 text-center text-muted-foreground"
				>
					{isLoadingMore && "Loading more..."}
					{!hasMore && allBangs.length > 0 && "You've reached the end"}
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
					isModified={false}
					isLoading={isActiveBangLoading}
					bang={
						activeBang
							? {
									name: activeBang.s,
									trigger: activeBang.t[0],
									url: activeBang.u,
									description:
										activeBang.desc || `Access ${activeBang.s} quickly.`,
									image: `https://www.google.com/s2/favicons?sz=128&domain=${activeBang.d}`,
								}
							: { name: "", trigger: "", url: "", image: "" }
					}
					subRoutes={
						activeBang?.sr?.map((sr) => ({
							id: sr.t[0],
							call: sr.t[0],
							url: sr.u,
							desc: sr.desc || "",
							suggestionUrl: sr.su,
						})) || []
					}
					onOpenSettings={() =>
						navigate({
							to: "/settings/mybangs",
							search: (prev) => ({
								...prev,
								bang: openBangTrigger,
							}),
						})
					}
					onCustomize={async () => {
						if (!activeBang) return;
						const primaryTrigger = activeBang.t[0];
						const existing = await db.userBangs
							.where("t")
							.equals(primaryTrigger)
							.first();

						if (existing) {
							navigate({
								to: "/settings/mybangs",
								search: (prev: Record<string, unknown>) => ({
									...prev,
									bang: primaryTrigger,
								}),
							});
							return;
						}

						const { id: _, ...bangData } = activeBang;
						const newId = await db.userBangs.add({
							...bangData,
							isCustom: true,
						});

						navigate({
							to: "/settings/mybangs",
							search: (prev: Record<string, unknown>) => ({
								...prev,
								bang: primaryTrigger || `new-${newId}`,
							}),
						});
					}}
					onOpenInStore={() => {}}
					onDeleteMainBang={() => {}}
				/>
			</Dialog>
		</div>
	);
}

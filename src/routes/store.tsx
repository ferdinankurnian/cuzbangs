import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { BangDetailsDialogContent } from "@/components/bang-details-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Item, ItemGroup, ItemTitle } from "@/components/ui/item";
import { db } from "@/lib/db";

export const Route = createFileRoute("/store")({
	validateSearch: (search: Record<string, unknown>): { bang?: string } => {
		return {
			bang: search.bang as string | undefined,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { bang: openBangId } = Route.useSearch();
	const [searchQuery, setSearchQuery] = useState("");

	const { data: filteredBangs = [] } = useQuery({
		queryKey: ["storeBangs", searchQuery],
		queryFn: async () => {
			if (!searchQuery) {
				return await db.storeBangs.orderBy("r").reverse().limit(30).toArray();
			}

			const query = searchQuery.toLowerCase();
			return await db.storeBangs
				.filter(
					(bang) =>
						bang.t.some((t) => t.toLowerCase().includes(query)) ||
						bang.s.toLowerCase().includes(query),
				)
				.limit(30)
				.toArray();
		},
	});

	return (
		<div className="min-h-screen flex flex-col max-w-5xl mx-auto mt-32 space-y-16 px-4 pb-24">
			<section className="text-center overflow-hidden space-y-8">
				<div className="flex flex-col items-center gap-6">
					<div className="flex flex-col items-center gap-2">
						<h1 className="text-4xl font-semibold text-white">Store</h1>
						<p className="text-lg text-primary/50">
							List all bangs. You can submit your bang here
						</p>
					</div>
					<InputGroup size="lg" className="max-w-xl">
						<InputGroupInput
							placeholder="Search for bangs or creators..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						<InputGroupAddon className="mr-[-8px]">
							<Search className="mb-[1px]" />
						</InputGroupAddon>
					</InputGroup>
				</div>

				<ItemGroup className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{filteredBangs.map((bang) => {
						const primaryTrigger = bang.t[0];
						const favicon = `https://www.google.com/s2/favicons?sz=128&domain=${bang.d}`;

						return (
							<Dialog
								key={bang.id}
								open={openBangId === primaryTrigger}
								onOpenChange={(open) => {
									if (!open) {
										navigate({
											search: (prev: Record<string, unknown>) => ({
												...prev,
												bang: undefined,
											}),
										});
									}
								}}
							>
								<DialogTrigger asChild>
									<Item
										variant="outline"
										className="hover:bg-secondary/50 active:scale-95 transition-all outline-0 cursor-default p-4 h-full flex flex-col"
										onClick={() => {
											navigate({
												search: (prev) => ({
													...prev,
													bang: primaryTrigger,
												}),
											});
										}}
									>
										<div className="mb-2">
											<div className="aspect-square w-full rounded-sm bg-muted overflow-hidden">
												<img
													src={favicon}
													alt={bang.s}
													className="w-full h-full object-contain p-4"
													onError={(e) => {
														(e.target as HTMLImageElement).src =
															`https://ui-avatars.com/api/?name=${encodeURIComponent(bang.s)}&background=random`;
													}}
												/>
											</div>
										</div>
										<div className="flex flex-col flex-1 justify-center">
											<ItemTitle className="mx-auto font-semibold text-sm line-clamp-1">
												{bang.s}
											</ItemTitle>
											<p className="text-[10px] text-muted-foreground mt-1">
												!{primaryTrigger}
											</p>
										</div>
									</Item>
								</DialogTrigger>
								<BangDetailsDialogContent
									mode="store"
									isModified={false}
									bang={{
										name: bang.s,
										url: bang.u,
										description: bang.desc || `Access ${bang.s} quickly.`,
										image: favicon,
									}}
									subRoutes={
										bang.sr?.map((sr) => ({
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
												bang: primaryTrigger,
											}),
										})
									}
									onCustomize={async () => {
										// Check if it already exists in userBangs
										const existing = await db.userBangs
											.where("t")
											.equals(primaryTrigger)
											.first();

										if (existing) {
											// If it exists, just navigate
											navigate({
												to: "/settings/mybangs",
												search: (prev: Record<string, unknown>) => ({
													...prev,
													bang: primaryTrigger,
												}),
											});
											return;
										}

										// Otherwise, copy to userBangs
										const { id: _, ...bangData } = bang;
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
						);
					})}

					{filteredBangs.length === 0 && searchQuery !== "" && (
						<div className="col-span-full py-20 text-center text-muted-foreground">
							No bangs found for "{searchQuery}"
						</div>
					)}
				</ItemGroup>
			</section>
		</div>
	);
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Download, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BangDetailsDialogContent } from "@/components/bang-details-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
	DropdownMenu as Dropdown,
	DropdownMenuContent as DropdownContent,
	DropdownMenuItem as DropdownItem,
	DropdownMenuTrigger as DropdownTrigger,
} from "@/components/ui/dropdown-menu";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Item,
	ItemContent,
	ItemGroup,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import { BangEntrySchema, type BangSubRoute, db } from "@/lib/db";

export const Route = createFileRoute("/settings/mybangs")({
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
	const [editingCount, setEditingCount] = useState(0);

	const handleEditingChange = (isEditing: boolean) => {
		setEditingCount((prev) => (isEditing ? prev + 1 : Math.max(0, prev - 1)));
	};

	// Use real database data
	const userBangs = useLiveQuery(() => db.userBangs.toArray()) || [];

	const handleAddBang = async () => {
		const newBang = {
			t: [""],
			s: "New Bang",
			u: "",
			r: 0,
			d: "",
			isCustom: true,
		};
		const id = await db.userBangs.add(newBang);
		navigate({ search: (prev) => ({ ...prev, bang: `new-${id}` }) });
	};

	const handleDeleteBang = async (id: number) => {
		await db.userBangs.delete(id);
		setEditingCount((prev) => Math.max(0, prev - 1));
	};

	const handleAddSubRoute = async (bangId: number) => {
		const bang = await db.userBangs.get(bangId);
		if (!bang) return;

		const newSubRoute = {
			t: [""],
			u: "",
			desc: "New Sub-route",
			isNew: true, // Internal flag for UI
		};

		const updatedSr = [...(bang.sr || []), newSubRoute];
		await db.userBangs.update(bangId, { sr: updatedSr as BangSubRoute[] });
	};

	const handleDeleteSubRoute = async (bangId: number, subTrigger: string) => {
		const bang = await db.userBangs.get(bangId);
		if (!bang) return;

		const updatedSr = (bang.sr || []).filter(
			(sr) => !sr.t.includes(subTrigger),
		);
		await db.userBangs.update(bangId, { sr: updatedSr });
	};

	const handleUpdateBang = async (
		id: number,
		data: {
			value: string;
			description: string;
			url: string;
			suggestionUrl: string;
		},
		subTrigger?: string,
	) => {
		try {
			const bang = await db.userBangs.get(id);
			if (!bang) return;

			if (subTrigger) {
				// Update sub-route
				const updatedSr = (bang.sr || []).map((sr) =>
					sr.t.includes(subTrigger)
						? {
								...sr,
								t: [data.value],
								u: data.url,
								su: data.suggestionUrl,
								desc: data.description,
							}
						: sr,
				);
				await db.userBangs.update(id, { sr: updatedSr });
			} else {
				// Update main bang
				let domain = "";
				try {
					domain = data.url ? new URL(data.url).hostname : "";
				} catch {
					// Fallback
				}

				const updatedData = {
					t: [data.value],
					s: data.value,
					u: data.url,
					desc: data.description,
					su: data.suggestionUrl,
					d: domain,
				};

				const validated = BangEntrySchema.partial().parse(updatedData);
				await db.userBangs.update(id, validated);
			}
		} catch (err) {
			console.error("Update Error:", err);
		}
	};

	const filteredBangs = useMemo(() => {
		return userBangs.filter(
			(bang) =>
				bang.s.toLowerCase().includes(searchQuery.toLowerCase()) ||
				bang.u.toLowerCase().includes(searchQuery.toLowerCase()) ||
				bang.t.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
		);
	}, [userBangs, searchQuery]);

	return (
		<div className="flex flex-col space-y-8">
			<div className="flex flex-col items-center gap-6">
				<div className="flex flex-row w-full items-center gap-2">
					<InputGroup size="lg">
						<InputGroupInput
							placeholder="Search bangs..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						<InputGroupAddon className="mr-[-8px]">
							<Search className="mb-[1px]" />
						</InputGroupAddon>
					</InputGroup>
					<Dropdown>
						<DropdownTrigger asChild>
							<Button
								size="icon-lg"
								variant="outline"
								className="p-[1.5rem] rounded-lg active:scale-94"
							>
								<Plus className="size-6" />
							</Button>
						</DropdownTrigger>
						<DropdownContent sideOffset={10} align="end">
							<DropdownItem onClick={handleAddBang}>
								<Plus /> Create a new bang
							</DropdownItem>
							<DropdownItem onClick={() => navigate({ to: "/store" })}>
								<Download /> Import from store
							</DropdownItem>
						</DropdownContent>
					</Dropdown>
				</div>
			</div>
			<ItemGroup className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{filteredBangs.map((bang) => {
					const primaryTrigger = bang.t[0];
					const isNew = openBangId === `new-${bang.id}`;
					const isOpen = openBangId === primaryTrigger || isNew;
					const favicon = bang.d
						? `https://www.google.com/s2/favicons?sz=128&domain=${bang.d}`
						: `https://ui-avatars.com/api/?name=${encodeURIComponent(bang.s)}&background=random`;

					return (
						<Dialog
							key={bang.id}
							open={isOpen}
							onOpenChange={(open) => {
								if (!open) {
									navigate({
										search: (prev) => ({ ...prev, bang: undefined }),
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
												bang: primaryTrigger || `new-${bang.id}`,
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
										<p className="text-[10px] text-muted-foreground mt-1 text-center">
											!{primaryTrigger || "???"}
										</p>
									</div>
								</Item>
							</DialogTrigger>
							<BangDetailsDialogContent
								mode="my-bangs"
								bang={{
									name: bang.s,
									url: bang.u,
									description: bang.desc,
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
								editingCount={editingCount}
								handleEditingChange={handleEditingChange}
								handleUpdateBang={(id, data) => {
									if (bang.id !== undefined) {
										// If id matches a sub-route trigger, update sub-route
										const isSubRoute = bang.sr?.some((sr) => sr.t.includes(id));
										handleUpdateBang(
											bang.id,
											data,
											isSubRoute ? id : undefined,
										);
									}
								}}
								handleDeleteBang={(id) => {
									if (bang.id !== undefined) {
										// If id matches a sub-route trigger, delete sub-route
										const isSubRoute = bang.sr?.some((sr) => sr.t.includes(id));
										if (isSubRoute) {
											handleDeleteSubRoute(bang.id, id);
										} else {
											handleDeleteBang(bang.id);
										}
									}
								}}
								handleAddBang={() => {
									if (bang.id !== undefined) handleAddSubRoute(bang.id);
								}}
								onOpenInStore={() =>
									navigate({
										to: "/store",
										search: (prev: Record<string, unknown>) => ({
											...prev,
											bang: primaryTrigger,
										}),
									})
								}
								onDeleteMainBang={() => {
									if (bang.id !== undefined) handleDeleteBang(bang.id);
								}}
								onCustomize={() => {}}
								onOpenSettings={() => {}}
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
		</div>
	);
}

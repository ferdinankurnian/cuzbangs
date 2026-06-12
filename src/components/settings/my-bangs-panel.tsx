import { useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Download, Link, Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BangDetailsDialogContent } from "@/components/bang-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Item, ItemGroup, ItemTitle } from "@/components/ui/item";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	getTriggerCollisions,
	normalizeBangTriggers,
	normalizeTrigger,
} from "@/lib/bangs";
import { BangEntrySchema, db } from "@/lib/db";

function formatTriggerList(triggers: string[]) {
	return triggers.map((trigger) => `"${trigger}"`).join(", ");
}

interface MyBangsPanelProps {
	openBangId?: string;
	onOpenBang: (bangId?: string) => void;
}

function CreateBangDialog({
	onSave,
	onDirtyChange,
	error,
	onErrorClear,
}: {
	onSave: (data: {
		triggers: string[];
		url: string;
	}) => boolean | undefined | Promise<boolean | undefined>;
	onDirtyChange: (isDirty: boolean) => void;
	error?: string;
	onErrorClear?: () => void;
}) {
	const [triggers, setTriggers] = useState<string[]>([]);
	const [triggerDraft, setTriggerDraft] = useState("");
	const [url, setUrl] = useState("");
	const [isUrlWarningOpen, setIsUrlWarningOpen] = useState(false);
	let domain = "";
	try {
		domain = url.trim() ? new URL(url.trim()).hostname : "";
	} catch {
		domain = "";
	}
	const previewName = domain
		? domain.replace(/^www\./, "").split(".")[0]
		: "Custom bang";
	const previewTitle = previewName
		? previewName.charAt(0).toUpperCase() + previewName.slice(1)
		: "Custom bang";
	const previewIcon = domain
		? `https://www.google.com/s2/favicons?sz=128&domain=${domain}`
		: undefined;
	const isDirty = triggers.length > 0 || !!triggerDraft.trim() || !!url.trim();
	const canSave =
		normalizeBangTriggers(triggers).length > 0 &&
		!!url.trim() &&
		!triggerDraft.trim();
	const urlHasQueryPlaceholder = url.includes("%s");

	useEffect(() => {
		onDirtyChange(isDirty);
	}, [isDirty, onDirtyChange]);

	const commitTriggerDraft = () => {
		const nextTrigger = normalizeTrigger(triggerDraft);
		if (!nextTrigger || triggers.includes(nextTrigger)) return;
		onErrorClear?.();
		setTriggers((prev) => [...prev, nextTrigger]);
		setTriggerDraft("");
	};

	const removeTrigger = (trigger: string) => {
		onErrorClear?.();
		setTriggers((prev) => prev.filter((item) => item !== trigger));
	};

	const handleSave = async () => {
		const uniqueTriggers = normalizeBangTriggers(triggers);

		if (!canSave) return;
		const result = await onSave({ triggers: uniqueTriggers, url: url.trim() });
		if (result === false) return;

		onDirtyChange(false);
		setTriggers([]);
		setTriggerDraft("");
		setUrl("");
		setIsUrlWarningOpen(false);
	};

	const handleCreateClick = () => {
		if (!canSave) return;
		if (!urlHasQueryPlaceholder) {
			setIsUrlWarningOpen(true);
			return;
		}
		handleSave();
	};

	return (
		<DialogContent
			showCloseButton={!isDirty}
			disableClose={isDirty}
			className="max-w-[410px] overflow-hidden rounded-xl border bg-background p-5 shadow-2xl sm:rounded-xl"
		>
			<div className="flex flex-col gap-4">
				<DialogHeader className="flex flex-row gap-4 space-y-0 text-left">
					<div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50">
						{previewIcon ? (
							<img
								src={previewIcon}
								alt=""
								className="size-10 rounded-sm object-contain"
								onError={(e) => {
									(e.target as HTMLImageElement).src =
										`https://ui-avatars.com/api/?name=${encodeURIComponent(previewTitle)}&background=random`;
								}}
							/>
						) : (
							<Plus className="size-7 text-muted-foreground" />
						)}
					</div>
					<div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
						<DialogTitle className="truncate text-base font-semibold">
							{previewTitle}
						</DialogTitle>
						<DialogDescription className="truncate text-sm">
							{domain || "Add a URL to finish setup"}
						</DialogDescription>
					</div>
				</DialogHeader>

				<div className="flex flex-row items-center justify-between gap-3">
					<div className="rounded-sm border px-3 py-2">
						<span className="text-xs text-muted-foreground">Custom bang</span>
					</div>
					<Popover open={isUrlWarningOpen} onOpenChange={setIsUrlWarningOpen}>
						<PopoverTrigger asChild>
							<Button
								onClick={handleCreateClick}
								disabled={!canSave}
								className="active:scale-[0.96]"
							>
								<Plus /> Create this bang
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-72 space-y-3">
							<div className="space-y-1">
								<p className="text-sm font-medium">No search placeholder</p>
								<p className="text-xs leading-5 text-muted-foreground">
									This URL has no %s, so this bang will open the page directly
									instead of passing your search query.
								</p>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsUrlWarningOpen(false)}
								>
									Edit URL
								</Button>
								<Button size="sm" onClick={handleSave}>
									Create anyway
								</Button>
							</div>
						</PopoverContent>
					</Popover>
				</div>

				<div className="h-px bg-border" />

				<div className="flex flex-col gap-3">
					<h2 className="text-xl font-semibold">Shortcut</h2>
					<div className="placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 flex-wrap items-center gap-2 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
						{triggers.map((trigger) => (
							<Badge
								key={trigger}
								variant="blue"
								className="h-6 gap-1 rounded-md px-2 font-medium"
							>
								{trigger}
								<button
									type="button"
									className="-mr-1 grid size-4 place-items-center rounded-sm opacity-70 transition-opacity hover:opacity-100"
									onClick={() => removeTrigger(trigger)}
								>
									<X className="size-3" aria-hidden />
								</button>
							</Badge>
						))}
						<input
							value={triggerDraft}
							onChange={(e) => {
								onErrorClear?.();
								setTriggerDraft(e.target.value.replace(/\s+/g, " "));
							}}
							placeholder="Trigger, press space"
							className="min-w-32 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
							onKeyDown={(e) => {
								if (e.key === " ") {
									e.preventDefault();
									commitTriggerDraft();
								}
								if (e.key === "Enter") handleSave();
							}}
						/>
					</div>
					{error && <p className="text-xs text-destructive">{error}</p>}
					<div className="relative">
						<Link className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={url}
							onChange={(e) => {
								onErrorClear?.();
								setUrl(e.target.value);
							}}
							placeholder="https://example.com/search?q=%s"
							className="h-9 rounded-md pl-9 font-mono text-sm"
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSave();
							}}
						/>
					</div>
				</div>
			</div>
		</DialogContent>
	);
}

export function MyBangsPanel({ openBangId, onOpenBang }: MyBangsPanelProps) {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [editingCount, setEditingCount] = useState(0);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isCreateDirty, setIsCreateDirty] = useState(false);
	const [createFormKey, setCreateFormKey] = useState(0);
	const [createError, setCreateError] = useState("");

	const handleCreateOpenChange = (open: boolean) => {
		if (!open && isCreateDirty) return;
		setIsCreateOpen(open);
		if (open || !isCreateDirty) {
			setCreateFormKey((prev) => prev + 1);
		}
		if (!open) {
			setIsCreateDirty(false);
			setCreateError("");
		}
	};

	const handleCreateDirtyChange = useCallback((isDirty: boolean) => {
		setIsCreateDirty(isDirty);
	}, []);

	const handleEditingChange = (isEditing: boolean) => {
		setEditingCount((prev) => (isEditing ? prev + 1 : Math.max(0, prev - 1)));
	};

	// Use real database data
	const userBangs = useLiveQuery(() => db.userBangs.toArray()) || [];

	const handleAddBang = async (data: { triggers: string[]; url: string }) => {
		const normalizedTriggers = normalizeBangTriggers(data.triggers);
		const primaryTrigger = normalizedTriggers[0];
		if (!primaryTrigger) return false;

		const collisions = getTriggerCollisions(
			await db.userBangs.toArray(),
			normalizedTriggers,
		);
		if (collisions.length > 0) {
			setCreateError(
				`Trigger ${formatTriggerList(collisions)} already exists in My Bangs.`,
			);
			return false;
		}

		let domain = "";
		try {
			domain = data.url ? new URL(data.url).hostname : "";
		} catch {
			// Keep domain empty when the URL is still being drafted.
		}

		const newBang = {
			t: normalizedTriggers,
			s: primaryTrigger,
			u: data.url,
			r: 0,
			d: domain,
			isCustom: true,
		};

		await db.userBangs.add(BangEntrySchema.parse(newBang));
		setCreateError("");
		setIsCreateDirty(false);
		setIsCreateOpen(false);
		setCreateFormKey((prev) => prev + 1);
		onOpenBang(primaryTrigger);
		return true;
	};

	const handleDeleteBang = async (id: number) => {
		await db.userBangs.delete(id);
		setEditingCount((prev) => Math.max(0, prev - 1));
	};

	const handleUpdateBang = async (
		id: number,
		data: {
			triggers: string[];
			url: string;
		},
	) => {
		try {
			const normalizedTriggers = normalizeBangTriggers(data.triggers);
			if (normalizedTriggers.length === 0) return false;

			const collisions = getTriggerCollisions(
				await db.userBangs.toArray(),
				normalizedTriggers,
				id,
			);
			if (collisions.length > 0) {
				alert(
					`Trigger ${formatTriggerList(collisions)} already exists in My Bangs.`,
				);
				return false;
			}

			let domain = "";
			try {
				domain = data.url ? new URL(data.url).hostname : "";
			} catch {
				// Keep domain empty when the URL is still being drafted.
			}

			const updatedData = {
				t: normalizedTriggers,
				s: normalizedTriggers[0],
				u: data.url,
				d: domain,
			};

			const validated = BangEntrySchema.partial().parse(updatedData);
			await db.userBangs.update(id, validated);
			onOpenBang(normalizedTriggers[0]);
			return true;
		} catch (err) {
			console.error("Update Error:", err);
			return false;
		}
	};

	const filteredBangs = useMemo(() => {
		const query = normalizeTrigger(searchQuery);
		if (!query) return userBangs;

		return userBangs.filter(
			(bang) =>
				bang.s.toLowerCase().includes(query) ||
				bang.u.toLowerCase().includes(query) ||
				normalizeBangTriggers(bang.t).some((t) => t.includes(query)),
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
					<Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
						<DialogTrigger asChild>
							<Button
								size="icon-lg"
								variant="outline"
								className="p-[1.5rem] rounded-lg active:scale-94"
							>
								<Plus className="size-6" />
							</Button>
						</DialogTrigger>
						<CreateBangDialog
							key={createFormKey}
							onSave={handleAddBang}
							onDirtyChange={handleCreateDirtyChange}
							error={createError}
							onErrorClear={() => setCreateError("")}
						/>
					</Dialog>
				</div>
			</div>
			<ItemGroup className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{filteredBangs.map((bang) => {
					const bangTriggers = normalizeBangTriggers(bang.t);
					const primaryTrigger = bangTriggers[0] ?? bang.s;
					const isOpen = bangTriggers.includes(
						normalizeTrigger(openBangId ?? ""),
					);
					const favicon = bang.d
						? `https://www.google.com/s2/favicons?sz=128&domain=${bang.d}`
						: `https://ui-avatars.com/api/?name=${encodeURIComponent(bang.s)}&background=random`;

					return (
						<Dialog
							key={bang.id}
							open={isOpen}
							onOpenChange={(open) => {
								if (!open) {
									onOpenBang(undefined);
								}
							}}
						>
							<DialogTrigger asChild>
								<Item
									variant="outline"
									className="hover:bg-secondary/50 active:scale-95 transition-all outline-0 p-4 h-full flex flex-col items-center text-center gap-2"
									onClick={() => {
										onOpenBang(primaryTrigger);
									}}
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
										<ItemTitle className="block font-semibold text-sm truncate w-full text-center">
											{bang.s}
										</ItemTitle>
										<p className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
											{primaryTrigger || "???"}
										</p>
									</div>
								</Item>
							</DialogTrigger>
							<BangDetailsDialogContent
								mode="my-bangs"
								bang={{
									name: bang.s,
									trigger: primaryTrigger,
									triggers: bang.t,
									url: bang.u,
									domain: bang.d,
									image: favicon,
								}}
								editingCount={editingCount}
								handleEditingChange={handleEditingChange}
								handleUpdateBang={(_, data) => {
									if (bang.id !== undefined) {
										return handleUpdateBang(bang.id, data);
									}
									return false;
								}}
								onDeleteMainBang={() => {
									if (bang.id !== undefined) handleDeleteBang(bang.id);
								}}
								onCustomize={() => {}}
								onOpenSettings={() => {}}
							/>
						</Dialog>
					);
				})}

				{filteredBangs.length === 0 && (
					<div className="col-span-full">
						{searchQuery !== "" ? (
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant="icon" className="size-12">
										<Search />
									</EmptyMedia>
									<EmptyTitle>No bangs found</EmptyTitle>
									<EmptyDescription>
										We couldn't find any bangs matching "{searchQuery}".
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						) : (
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant="icon" className="size-12">
										<Plus />
									</EmptyMedia>
									<EmptyTitle>No bangs yet</EmptyTitle>
									<EmptyDescription>
										You haven't added any custom bangs. Create your own or
										import from the store.
									</EmptyDescription>
								</EmptyHeader>
								<EmptyContent>
									<div className="grid grid-cols-2 gap-4">
										<Button onClick={() => setIsCreateOpen(true)}>
											<Plus /> Create your first bang
										</Button>
										<Button
											variant="outline"
											onClick={() => navigate({ to: "/store" })}
										>
											<Download /> Go to Store
										</Button>
									</div>
								</EmptyContent>
							</Empty>
						)}
					</div>
				)}
			</ItemGroup>
		</div>
	);
}

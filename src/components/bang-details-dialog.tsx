import { Check, Edit2, Link, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { normalizeBangTriggers, normalizeTrigger } from "@/lib/bangs";
import { cn } from "@/lib/utils";

interface EditableBangCallProps {
	value: string;
	triggers?: string[];
	prefix?: string;
	variant?: "blue" | "green" | "secondary";
	url?: string;
	onEditingChange?: (isEditing: boolean) => void;
	onDelete?: () => void;
	onSave?: (data: {
		triggers: string[];
		url: string;
	}) => boolean | undefined | Promise<boolean | undefined>;
	onCancel?: () => void;
	readOnly?: boolean;
}

function EditableBangCall({
	value,
	triggers,
	prefix,
	variant,
	url,
	onEditingChange,
	onDelete,
	onSave,
	onCancel,
	readOnly = false,
}: EditableBangCallProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editTriggers, setEditTriggers] = useState(() =>
		normalizeBangTriggers(triggers?.length ? triggers : [value]),
	);
	const [triggerDraft, setTriggerDraft] = useState("");
	const [editUrl, setEditUrl] = useState(url ?? "");

	const [copiedTrigger, setCopiedTrigger] = useState<string | null>(null);

	const stopEditing = () => {
		setIsEditing(false);
		onEditingChange?.(false);
	};

	const handleCopy = (trigger: string) => {
		const textToCopy = prefix ? `${prefix}${trigger}` : trigger;
		navigator.clipboard.writeText(textToCopy);
		setCopiedTrigger(trigger);
		setTimeout(() => setCopiedTrigger(null), 2000);
	};

	const commitTriggerDraft = () => {
		const nextTrigger = normalizeTrigger(triggerDraft);
		if (!nextTrigger || editTriggers.includes(nextTrigger)) return;
		setEditTriggers((prev) => [...prev, nextTrigger]);
		setTriggerDraft("");
	};

	const removeTrigger = (trigger: string) => {
		setEditTriggers((prev) => prev.filter((item) => item !== trigger));
	};

	const handleSave = async () => {
		const nextTriggers = normalizeBangTriggers(
			triggerDraft.trim() ? [...editTriggers, triggerDraft] : editTriggers,
		);
		if (nextTriggers.length === 0) return;

		const result = await onSave?.({
			triggers: nextTriggers,
			url: editUrl,
		});
		if (result === false) return;
		stopEditing();
	};

	const startEditing = () => {
		if (readOnly) return;
		setEditTriggers(
			normalizeBangTriggers(triggers?.length ? triggers : [value]),
		);
		setTriggerDraft("");
		setEditUrl(url ?? "");
		setIsEditing(true);
		onEditingChange?.(true);
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
			return;
		}
		setEditTriggers(
			normalizeBangTriggers(triggers?.length ? triggers : [value]),
		);
		setTriggerDraft("");
		setEditUrl(url ?? "");
		stopEditing();
	};

	return (
		<AnimatePresence mode="wait" initial={false}>
			{isEditing && !readOnly ? (
				<motion.div
					key="editing"
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
					transition={{ duration: 0.2, ease: "easeOut" }}
					className={cn(
						"flex flex-col gap-3 w-full p-4 rounded-xl border bg-muted/20 relative",
					)}
				>
					<div className="absolute right-2 top-2 flex flex-row gap-1">
						<Button
							size="icon"
							variant="ghost"
							className="size-6 hover:bg-green-500/20 hover:text-green-600"
							onClick={handleSave}
						>
							<Check className="size-3.5" />
						</Button>
						<Button
							size="icon"
							variant="ghost"
							className="size-6 hover:bg-red-500/20 hover:text-red-600"
							onClick={handleCancel}
						>
							<X className="size-3.5" />
						</Button>
					</div>

					<div className="flex flex-col gap-1.5">
						<span className="text-xs font-semibold text-muted-foreground ml-1">
							Triggers
						</span>
						<div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2">
							{editTriggers.map((trigger) => (
								<Badge key={trigger} variant="secondary" className="gap-1">
									{prefix}
									{trigger}
									<button type="button" onClick={() => removeTrigger(trigger)}>
										<X className="size-3" />
									</button>
								</Badge>
							))}
							<input
								value={triggerDraft}
								onChange={(e) =>
									setTriggerDraft(e.target.value.replace(/\s+/g, " "))
								}
								placeholder="type trigger, press space"
								className="min-w-32 flex-1 bg-transparent text-sm outline-none"
								onKeyDown={(e) => {
									if (e.key === " ") {
										e.preventDefault();
										commitTriggerDraft();
									}
									if (e.key === "Enter") handleSave();
									if (e.key === "Escape") handleCancel();
								}}
							/>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<span className="text-xs font-semibold text-muted-foreground ml-1">
							Configuration
						</span>
						<div className="relative">
							<Link className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
							<Input
								placeholder="Target URL (use %s for query)..."
								value={editUrl}
								onChange={(e) => setEditUrl(e.target.value)}
								className="h-9 text-sm pl-8 font-mono text-xs"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSave();
									if (e.key === "Escape") handleCancel();
								}}
							/>
						</div>
					</div>

					{onDelete && (
						<div className="flex justify-start">
							<Button
								variant="ghost"
								size="sm"
								className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-7 text-xs px-2"
								onClick={onDelete}
							>
								<Trash2 className="size-3.5 mr-1.5" /> Delete Shortcut
							</Button>
						</div>
					)}
				</motion.div>
			) : (
				<motion.div
					key="view"
					initial={{ opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
					transition={{ duration: 0.2, ease: "easeOut" }}
					className="flex flex-col gap-2 w-full"
				>
					<div className="flex flex-wrap gap-2 items-start">
						{(triggers?.length ? triggers : [value]).map((trigger) => (
							<Tooltip key={trigger}>
								<TooltipTrigger asChild>
									<button
										type="button"
										className="group flex w-fit flex-row items-center gap-1 rounded-sm border-none bg-transparent p-0 outline-none transition-[scale] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										onClick={
											readOnly ? () => handleCopy(trigger) : startEditing
										}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												if (readOnly) handleCopy(trigger);
												else startEditing();
											}
										}}
									>
										<Badge variant={variant ?? "secondary"} className="text-sm">
											{prefix ? `${prefix}${trigger}` : trigger}
										</Badge>
										{!readOnly && (
											<Edit2 className="size-3 opacity-0 transition-opacity group-hover:opacity-50" />
										)}
									</button>
								</TooltipTrigger>
								{readOnly && (
									<TooltipContent>
										{copiedTrigger === trigger ? "Copied" : "Click to copy"}
									</TooltipContent>
								)}
							</Tooltip>
						))}
					</div>
					{url && (
						<Input
							type="text"
							value={url}
							readOnly
							onClick={(e) => e.currentTarget.select()}
						/>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
}

interface BangDetailsDialogProps {
	mode: "my-bangs" | "store";
	bang: {
		name: string;
		trigger: string;
		triggers?: string[];
		url: string;
		domain?: string;
		image: string;
		subroutes?: {
			name: string;
			triggers: string[];
			url: string;
			baseUrl: string;
		}[];
	};
	isModified?: boolean;
	editingCount?: number;
	handleEditingChange?: (isEditing: boolean) => void;
	handleUpdateBang?: (
		id: string,
		data: {
			triggers: string[];
			url: string;
		},
	) => boolean | undefined | Promise<boolean | undefined>;
	isLoading?: boolean;
	onCustomize?: () => void;
	onOpenSettings?: () => void;
	onDeleteMainBang?: () => void;
	onResetStoreOverride?: () => void;
}

export function BangDetailsDialogContent({
	mode,
	bang,
	isModified,
	editingCount = 0,
	isLoading,
	handleEditingChange,
	handleUpdateBang,
	onCustomize,
	onOpenSettings,
	onDeleteMainBang,
	onResetStoreOverride,
}: BangDetailsDialogProps) {
	const isReadOnly = mode === "store";
	const subroutes = bang.subroutes ?? [];
	const isSearchUrl = (url: string) =>
		url.includes("{{{s}}}") || url.includes("%s");

	if (isLoading) {
		return (
			<DialogContent className="overflow-hidden">
				<div className="flex flex-col gap-4 animate-pulse">
					<DialogHeader className="flex flex-row gap-4">
						<div className="size-16 rounded-sm bg-muted" />
						<div className="flex flex-col justify-center gap-2 flex-1">
							<div className="h-6 w-3/4 bg-muted rounded" />
							<div className="h-4 w-1/2 bg-muted rounded" />
						</div>
					</DialogHeader>

					<div className="flex flex-row justify-between items-center">
						<div className="h-8 w-32 bg-muted rounded" />
						<div className="h-10 w-40 bg-muted rounded" />
					</div>

					<Separator />

					<div className="flex flex-col gap-2 mb-2">
						<div className="h-7 w-32 bg-muted rounded" />
						<div className="h-20 w-full bg-muted rounded-xl" />
					</div>
				</div>
			</DialogContent>
		);
	}

	return (
		<DialogContent
			onPointerDownOutside={(e) => {
				if (!isReadOnly && editingCount > 0) e.preventDefault();
			}}
			onEscapeKeyDown={(e) => {
				if (!isReadOnly && editingCount > 0) e.preventDefault();
			}}
			showCloseButton={isReadOnly || editingCount === 0}
			className="overflow-hidden"
		>
			<div className="flex flex-col gap-4">
				<DialogHeader className="flex flex-row gap-4">
					<img src={bang.image} alt="" className="size-16 rounded-sm" />
					<div className="flex flex-col justify-center gap-2">
						<DialogTitle>{bang.name}</DialogTitle>
						<DialogDescription>{bang.domain ?? bang.url}</DialogDescription>
					</div>
				</DialogHeader>

				<div className="flex flex-row justify-between items-center">
					<div className="h-full flex flex-row gap-2 items-center">
						{isModified ? (
							<div className="border rounded-sm px-3 h-full flex items-center">
								<span className="text-green-500">Modified by You</span>
							</div>
						) : mode === "store" ? (
							<div className="border rounded-sm px-3 h-full flex items-center">
								<span className="text-muted-foreground text-xs">
									Official Preset
								</span>
							</div>
						) : (
							<div className="border rounded-sm px-3 h-full flex items-center">
								<span className="text-green-500">Modified by You</span>
							</div>
						)}
					</div>
					<div className="flex flex-row gap-2">
						{mode === "my-bangs" ? (
							<Popover>
								<PopoverTrigger asChild>
									<Button size="icon" variant="outline">
										<Trash2 className="text-red-500" />
									</Button>
								</PopoverTrigger>
								<PopoverContent align="end" className="space-y-2">
									<p className="text-sm font-medium">
										Are you sure you want to delete?
									</p>
									<Button
										variant="destructive"
										className="w-full"
										onClick={onDeleteMainBang}
									>
										Yes, delete it
									</Button>
								</PopoverContent>
							</Popover>
						) : isModified ? (
							<>
								<Button variant="outline" onClick={onResetStoreOverride}>
									Reset to store
								</Button>
								<Button variant="outline" onClick={onOpenSettings}>
									<Edit2 /> Open in Settings
								</Button>
							</>
						) : (
							<Button onClick={onCustomize}>
								<Plus /> Customize this bang
							</Button>
						)}
					</div>
				</div>

				<Separator />

				<div className="flex flex-col gap-4 mb-2">
					<div className="flex flex-col gap-2">
						<h1 className="text-xl font-semibold">Main Route</h1>
						<div className="flex flex-col gap-2">
							<EditableBangCall
								value={bang.trigger}
								triggers={bang.triggers}
								url={bang.url}
								variant={isSearchUrl(bang.url) ? "green" : "blue"}
								onEditingChange={handleEditingChange}
								onSave={
									handleUpdateBang
										? (data) => handleUpdateBang(bang.trigger, data)
										: undefined
								}
								readOnly={isReadOnly}
							/>
						</div>
					</div>

					{subroutes.length > 0 && (
						<div className="flex flex-col gap-3">
							<h1 className="text-xl font-semibold">Sub Routes</h1>
							<div className="flex flex-col gap-5">
								{subroutes.map((subroute) => (
									<div
										key={`${subroute.name}-${subroute.triggers.join("-")}`}
										className="flex flex-col gap-2"
									>
										<h2 className="text-sm font-medium text-muted-foreground">
											{subroute.name}
										</h2>
										<EditableBangCall
											value={subroute.triggers[0] ?? subroute.name}
											triggers={subroute.triggers}
											prefix="/"
											url={subroute.url}
											variant="secondary"
											readOnly
										/>
										<Input
											type="text"
											value={subroute.baseUrl}
											readOnly
											onClick={(e) => e.currentTarget.select()}
											className="text-muted-foreground"
										/>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</DialogContent>
	);
}

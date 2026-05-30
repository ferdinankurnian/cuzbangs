import {
	Check,
	Copy,
	Edit2,
	ExternalLink,
	Link,
	Plus,
	Sparkles,
	Split,
	Trash2,
	X,
} from "lucide-react";
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
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface BangRoute {
	id: string;
	call: string;
	url: string;
	desc: string;
	suggestionUrl?: string;
	isNew?: boolean;
}

interface EditableBangCallProps {
	value: string;
	prefix?: string;
	variant?: "blue" | "green" | "secondary";
	description?: string;
	url?: string;
	suggestionUrl?: string;
	onEditingChange?: (isEditing: boolean) => void;
	onDelete?: () => void;
	onSave?: (data: {
		value: string;
		description: string;
		url: string;
		suggestionUrl: string;
	}) => void;
	onCancel?: () => void;
	defaultEditing?: boolean;
	isNew?: boolean;
	readOnly?: boolean;
}

function EditableBangCall({
	value,
	prefix,
	variant,
	description,
	url,
	suggestionUrl,
	onEditingChange,
	onDelete,
	onSave,
	onCancel,
	defaultEditing = false,
	isNew = false,
	readOnly = false,
}: EditableBangCallProps) {
	const [isEditing, setIsEditing] = useState(defaultEditing);
	const [editValue, setEditValue] = useState(value);
	const [editDesc, setEditDesc] = useState(description ?? "");
	const [editUrl, setEditUrl] = useState(url ?? "");
	const [editSuggestionUrl, setEditSuggestionUrl] = useState(
		suggestionUrl ?? "",
	);

	const [copied, setCopied] = useState(false);

	const stopEditing = () => {
		setIsEditing(false);
		onEditingChange?.(false);
	};

	const handleCopy = () => {
		const textToCopy = prefix ? `${prefix}${value}` : value;
		navigator.clipboard.writeText(textToCopy);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleSave = () => {
		onSave?.({
			value: editValue,
			description: editDesc,
			url: editUrl,
			suggestionUrl: editSuggestionUrl,
		});
		stopEditing();
	};

	const startEditing = () => {
		if (readOnly) return;
		setEditValue(value);
		setEditDesc(description ?? "");
		setEditUrl(url ?? "");
		setEditSuggestionUrl(suggestionUrl ?? "");
		setIsEditing(true);
		onEditingChange?.(true);
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
			return;
		}
		setEditValue(value);
		setEditDesc(description ?? "");
		setEditUrl(url ?? "");
		setEditSuggestionUrl(suggestionUrl ?? "");
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
							Trigger & Description
						</span>
						<div className="flex flex-col gap-2">
							<InputGroup size="sm" className="w-full">
								{prefix && (
									<InputGroupAddon align="inline-start" className="ml-[-6px]">
										<span className="text-muted-foreground text-sm">
											{prefix}
										</span>
									</InputGroupAddon>
								)}
								<InputGroupInput
									value={editValue}
									onChange={(e) => setEditValue(e.target.value)}
									className="w-full font-medium"
									autoFocus
									onKeyDown={(e) => {
										if (e.key === "Enter") handleSave();
										if (e.key === "Escape") handleCancel();
									}}
								/>
							</InputGroup>
							<Input
								placeholder="Description..."
								value={editDesc}
								onChange={(e) => setEditDesc(e.target.value)}
								className="h-8 text-sm"
								onKeyDown={(e) => {
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
						<div className="grid grid-cols-1 gap-2">
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
							<div className="relative">
								<Sparkles className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
								<Input
									placeholder="Suggestion URL (optional)..."
									value={editSuggestionUrl}
									onChange={(e) => setEditSuggestionUrl(e.target.value)}
									className="h-9 text-sm pl-8 font-mono text-xs"
									onKeyDown={(e) => {
										if (e.key === "Enter") handleSave();
										if (e.key === "Escape") handleCancel();
									}}
								/>
							</div>
						</div>
					</div>

					{onDelete && !isNew && (
						<div className="flex justify-start">
							<Button
								variant="ghost"
								size="sm"
								className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-7 text-xs px-2"
								onClick={onDelete}
							>
								<Trash2 className="size-3.5 mr-1.5" /> Delete Route
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
					<div className="flex flex-col gap-1 items-start">
						<button
							type="button"
							className="group flex flex-row items-center gap-2 w-fit active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm border-none bg-transparent p-0"
							onClick={readOnly ? handleCopy : startEditing}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									if (readOnly) handleCopy();
									else startEditing();
								}
							}}
						>
							<Badge variant={variant ?? "secondary"} className="text-sm">
								{prefix ? `${prefix}${value}` : value}
							</Badge>
							{readOnly ? (
								<div className="opacity-0 transition-opacity group-hover:opacity-50">
									{copied ? (
										<Check className="size-3 text-green-500" />
									) : (
										<Copy className="size-3" />
									)}
								</div>
							) : (
								<Edit2 className="size-3 opacity-0 transition-opacity group-hover:opacity-50" />
							)}
						</button>
						{description && (
							<p className="text-xs text-muted-foreground line-clamp-1 ml-1">
								{description}
							</p>
						)}
					</div>
					{url && (
						<Input
							type="text"
							value={url}
							readOnly
							onClick={(e) => e.currentTarget.select()}
						/>
					)}
					{suggestionUrl && (
						<Input
							type="text"
							value={suggestionUrl}
							readOnly
							className="text-muted-foreground"
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
		url: string;
		description?: string;
		image: string;
	};
	subRoutes: BangRoute[];
	isModified?: boolean;
	editingCount?: number;
	handleEditingChange?: (isEditing: boolean) => void;
	handleUpdateBang?: (
		id: string,
		data: {
			value: string;
			description: string;
			url: string;
			suggestionUrl: string;
		},
	) => void;
	handleDeleteBang?: (id: string) => void;
	handleAddBang?: () => void;
	isLoading?: boolean;
	onCustomize?: () => void;
	onOpenSettings?: () => void;
	onDeleteMainBang?: () => void;
	onOpenInStore?: () => void;
}

export function BangDetailsDialogContent({
	mode,
	bang,
	subRoutes,
	isModified,
	editingCount = 0,
	isLoading,
	handleEditingChange,
	handleUpdateBang,
	handleDeleteBang,
	handleAddBang,
	onCustomize,
	onOpenSettings,
	onDeleteMainBang,
	onOpenInStore,
}: BangDetailsDialogProps) {
	const isReadOnly = mode === "store";

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

					<div className="flex flex-col gap-2">
						<div className="h-7 w-32 bg-muted rounded" />
						<div className="h-40 w-full bg-muted rounded-xl" />
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
						<DialogDescription>{bang.url}</DialogDescription>
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
							<>
								<Button onClick={onOpenInStore}>
									<ExternalLink />
									Open in store
								</Button>
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
							</>
						) : isModified ? (
							<Button variant="outline" onClick={onOpenSettings}>
								<Edit2 /> Open in Settings
							</Button>
						) : (
							<Button onClick={onCustomize}>
								<Plus /> Customize this bang
							</Button>
						)}
					</div>
				</div>

				<Separator />

				<div className="flex flex-col gap-2 mb-2">
					<h1 className="text-xl font-semibold">Main Routes</h1>
					<div className="flex flex-col gap-2">
						<EditableBangCall
							value={bang.trigger}
							description={bang.description || `Main shortcut for ${bang.name}`}
							url={bang.url}
							variant={bang.url.includes("%s") ? "green" : "blue"}
							onEditingChange={handleEditingChange}
							readOnly={isReadOnly}
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex flex-row justify-between items-center">
						<h1 className="text-xl font-semibold">Sub Routes</h1>
						{!isReadOnly && (
							<Button size="icon" variant="outline" onClick={handleAddBang}>
								<Plus />
							</Button>
						)}
					</div>
					<div className="flex flex-col">
						<AnimatePresence mode="popLayout" initial={false}>
							{subRoutes.length === 0 ? (
								<motion.div
									key="empty"
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									className="flex flex-col items-center justify-center py-10 text-center rounded-xl bg-muted/5"
								>
									<div className="bg-muted size-12 rounded-full flex items-center justify-center mb-4">
										<Split className="size-6 text-muted-foreground/50" />
									</div>
									<h3 className="text-sm font-medium">No sub-routes found</h3>
									<p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
										{isReadOnly
											? "This bang doesn't have any sub-routes."
											: "It's looking a bit lonely here. Add your first sub-route!"}
									</p>
								</motion.div>
							) : (
								subRoutes.map((item) => (
									<motion.div
										key={item.id}
										layout
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{
											opacity: 0,
											scale: 0.95,
											transition: { duration: 0.1 },
										}}
										transition={{ duration: 0.2 }}
										className="pb-4"
									>
										<EditableBangCall
											prefix={`${bang.name.toLowerCase().replace(" site", "")}/`}
											value={item.call}
											description={item.desc}
											url={item.url}
											suggestionUrl={item.suggestionUrl}
											variant={item.url.includes("%s") ? "green" : "secondary"}
											defaultEditing={item.isNew}
											isNew={item.isNew}
											onEditingChange={handleEditingChange}
											onDelete={
												handleDeleteBang
													? () => handleDeleteBang(item.id)
													: undefined
											}
											onSave={
												handleUpdateBang
													? (data) => handleUpdateBang(item.id, data)
													: undefined
											}
											onCancel={
												item.isNew && handleDeleteBang
													? () => handleDeleteBang(item.id)
													: undefined
											}
											readOnly={isReadOnly}
										/>
									</motion.div>
								))
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</DialogContent>
	);
}

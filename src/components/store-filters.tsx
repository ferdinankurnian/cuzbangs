import { Check, RotateCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StoreStatus = "all" | "added" | "not-added";

const STATUS_OPTIONS: { value: StoreStatus; label: string; hint: string }[] = [
	{ value: "all", label: "All bangs", hint: "Everything" },
	{ value: "added", label: "Added", hint: "In your library" },
	{ value: "not-added", label: "Not added", hint: "Discover new" },
];

type StoreFiltersProps = {
	categories: string[];
	counts?: Map<string, number>;
	total?: number;
	selectedCategory: string;
	status: StoreStatus;
	hasSubroutes: boolean;
	hasActiveFilters: boolean;
	onCategoryChange: (cat: string) => void;
	onStatusChange: (status: StoreStatus) => void;
	onSubroutesChange: (value: boolean) => void;
	onReset: () => void;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="px-3 text-xs font-semibold text-muted-foreground">
			{children}
		</p>
	);
}

function FilterCheckbox({ checked }: { checked: boolean }) {
	return (
		<span
			className={cn(
				"flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-all",
				checked
					? "border-primary bg-primary text-primary-foreground"
					: "border-input bg-input/30 dark:bg-input/50",
			)}
		>
			{checked && <Check className="size-3" strokeWidth={3} />}
		</span>
	);
}

export function StoreFilters({
	categories,
	counts,
	total,
	selectedCategory,
	status,
	hasSubroutes,
	hasActiveFilters,
	onCategoryChange,
	onStatusChange,
	onSubroutesChange,
	onReset,
}: StoreFiltersProps) {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<SectionLabel>Category</SectionLabel>
				<div className="flex flex-wrap gap-1.5">
					{categories.map((cat) => {
						const isActive = selectedCategory === cat;
						const count = cat === "all" ? total : counts?.get(cat);
						return (
							<Badge
								key={cat}
								variant={isActive ? "default" : "outline"}
								className={cn(
									"cursor-default gap-1.5 px-3 py-1 text-xs capitalize transition-all active:scale-95",
									!isActive && "hover:bg-secondary/80",
								)}
								onClick={() => onCategoryChange(cat)}
							>
								{cat === "all" ? "All" : cat}
								{count !== undefined && (
									<span
										className={cn(
											"text-[11px]",
											isActive
												? "text-primary-foreground/70"
												: "text-muted-foreground",
										)}
									>
										{count.toLocaleString()}
									</span>
								)}
							</Badge>
						);
					})}
				</div>
			</div>

			<Separator />

			<div className="space-y-2">
				<SectionLabel>Library status</SectionLabel>
				<div className="space-y-0.5">
					{STATUS_OPTIONS.map((option) => {
						const isActive = status === option.value;
						return (
							<button
								key={option.value}
								type="button"
								onClick={() => onStatusChange(option.value)}
								className={cn(
									"flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors",
									isActive
										? "bg-secondary text-foreground"
										: "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
								)}
							>
								<span className="min-w-0">
									<span
										className={cn(
											"block truncate text-sm",
											isActive && "font-medium",
										)}
									>
										{option.label}
									</span>
									<span className="block truncate text-xs text-muted-foreground">
										{option.hint}
									</span>
								</span>
								<span
									className={cn(
										"flex size-4 shrink-0 items-center justify-center",
										isActive ? "text-foreground" : "text-transparent",
									)}
								>
									<Check
										className={cn(
											"size-4 transition-all",
											isActive ? "opacity-100" : "opacity-0",
										)}
										strokeWidth={3}
									/>
								</span>
							</button>
						);
					})}
				</div>
			</div>

			<Separator />

			<div className="space-y-2">
				<SectionLabel>Features</SectionLabel>
				<button
					type="button"
					onClick={() => onSubroutesChange(!hasSubroutes)}
					className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary/60"
				>
					<span className="min-w-0">
						<span className="block truncate text-sm">Has subroutes</span>
						<span className="block truncate text-xs text-muted-foreground">
							Bangs with sub-triggers
						</span>
					</span>
					<FilterCheckbox checked={hasSubroutes} />
				</button>
			</div>

			{hasActiveFilters && (
				<button
					type="button"
					onClick={onReset}
					className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
				>
					<RotateCcw className="size-3.5" />
					Reset filters
				</button>
			)}
		</div>
	);
}

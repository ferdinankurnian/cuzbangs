import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BangDetailsDialogContent } from "@/components/bang-details-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/test-modal")({
	component: RouteComponent,
});

function RouteComponent() {
	// 1. Pake State buat control UI (biar ga refresh/re-render via Router)
	const [openItemId, setOpenItemId] = useState<string | null>(null);

	// Generate 50 dummy items to ensure scrolling
	const items = Array.from({ length: 50 }, (_, i) => ({
		id: `item-${i + 1}`,
		name: `Test Item ${i + 1}`,
	}));

	const handleOpen = (id: string) => {
		setOpenItemId(id);
		// 2. Update URL manual (Native API) - Gak bakal trigger scroll reset router
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set("itemId", id);
		window.history.pushState({}, "", newUrl);
	};

	const handleClose = () => {
		setOpenItemId(null);
		// Balikin URL bersih
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.delete("itemId");
		window.history.pushState({}, "", newUrl);
	};

	return (
		<div className="min-h-screen flex flex-col max-w-2xl mx-auto mt-20 space-y-8 px-4 pb-24">
			<div className="space-y-4">
				<h1 className="text-3xl font-bold">Scroll Test (Manual History)</h1>
				<p className="text-muted-foreground">
					Using useState + window.history.pushState. Bypassing Router
					completely.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4">
				{items.map((item) => (
					<Dialog
						key={item.id}
						open={openItemId === item.id}
						onOpenChange={(open) => {
							if (!open) handleClose();
						}}
					>
						<DialogTrigger asChild>
							<button
								type="button"
								onClick={() => handleOpen(item.id)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										handleOpen(item.id);
									}
								}}
								className="w-full text-left p-6 border rounded-lg hover:bg-muted/50 transition-colors"
							>
								<h3 className="font-semibold">{item.name}</h3>
								<p className="text-sm text-muted-foreground">
									Click me (Manual History API)
								</p>
							</button>
						</DialogTrigger>
						<BangDetailsDialogContent
							mode="store"
							bang={{
								name: item.name,
								trigger: item.id,
								url: `https://example.com/${item.id}`,
								image: `https://ui-avatars.com/api/?name=${item.name}`,
							}}
							onOpenSettings={() => {}}
							onCustomize={() => {}}
							onDeleteMainBang={() => {}}
						/>
					</Dialog>
				))}
			</div>
		</div>
	);
}

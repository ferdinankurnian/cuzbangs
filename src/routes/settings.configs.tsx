import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Download, Upload } from "lucide-react";
import { useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { type AppConfig, db } from "@/lib/db";

export const Route = createFileRoute("/settings/configs")({
	component: ConfigsPage,
});

const SYMBOLS = ["!", "@", "#", "$", "."] as const;

const DEFAULT_CONFIG: AppConfig = {
	selectedEngine: "google",
	customUrl: "https://www.bing.com/search?go=Search&q=%s&qs=c",
	selectedSymbol: "!",
	forceBangsFirst: false,
	useStoreBangs: true,
};

function ConfigsPage() {
	const config = useLiveQuery(() => db.configs.toCollection().first());
	const customUrlId = useId();

	useEffect(() => {
		const initConfig = async () => {
			const existing = await db.configs.toCollection().first();
			if (!existing) {
				await db.configs.add(DEFAULT_CONFIG);
			}
		};
		initConfig();
	}, []);

	const updateConfig = async (updates: Partial<AppConfig>) => {
		if (config?.id) {
			await db.configs.update(config.id, updates);
		}
	};

	const handleExport = async () => {
		const userBangs = await db.userBangs.toArray();
		const configData = await db.configs.toCollection().first();

		const exportFile = {
			version: 1,
			userBangs,
			config: configData,
		};

		const blob = new Blob([JSON.stringify(exportFile, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `cuzbangs-backup-${new Date().toISOString().split("T")[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleImport = async () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			const text = await file.text();
			try {
				const data = JSON.parse(text);
				if (data.userBangs) {
					// Clearing existing userBangs might be too destructive, let's just add new ones
					// or maybe merge? Let's use bulkPut to overwrite by ID if exists, or just add.
					await db.userBangs.bulkPut(data.userBangs);
				}
				if (data.config) {
					const { id: _, ...configToUpdate } = data.config;
					await updateConfig(configToUpdate);
				}
				alert("Settings imported successfully!");
			} catch (err) {
				console.error("Import error:", err);
				alert("Failed to import settings. Check console for details.");
			}
		};
		input.click();
	};

	if (!config) return null;

	return (
		<section className="space-y-6 max-w-2xl mx-auto pb-24">
			{/* Import / Export Settings */}
			<Card>
				<CardHeader>
					<CardTitle>Import / Export Settings</CardTitle>
					<CardDescription>
						Import or export your settings with a cuzbangs JSON file.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-3">
					<Button variant="outline" onClick={handleImport}>
						<Upload className="size-4" />
						Import from JSON
					</Button>
					<Button variant="outline" onClick={handleExport}>
						<Download className="size-4" />
						Download as JSON
					</Button>
				</CardContent>
			</Card>

			{/* Default Search Engine */}
			<Card>
				<CardHeader className="flex flex-row items-start justify-between space-y-0">
					<div className="space-y-1.5">
						<CardTitle>Default Search Engine</CardTitle>
						<CardDescription>
							Choose your default search engine for searching without calling
							bangs
						</CardDescription>
					</div>
					<Select
						value={config.selectedEngine}
						onValueChange={(val) => updateConfig({ selectedEngine: val })}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Select engine" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="google">Google</SelectItem>
							<SelectItem value="bing">Bing</SelectItem>
							<SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
							<SelectItem value="custom">Custom</SelectItem>
						</SelectContent>
					</Select>
				</CardHeader>
				{config.selectedEngine === "custom" && (
					<CardContent className="space-y-3">
						<Label htmlFor={customUrlId}>Custom URL</Label>
						<Input
							id={customUrlId}
							value={config.customUrl}
							onChange={(e) => updateConfig({ customUrl: e.target.value })}
							placeholder="https://example.com/search?q=%s"
						/>
					</CardContent>
				)}
			</Card>

			{/* Custom Symbol to call */}
			<Card>
				<CardHeader>
					<CardTitle>Custom Symbol to call</CardTitle>
					<CardDescription>
						You can custom the symbol to call bangs like !yt or @yt for youtube
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex gap-2">
						{SYMBOLS.map((symbol) => (
							<Button
								key={symbol}
								variant={
									config.selectedSymbol === symbol ? "default" : "outline"
								}
								size="icon"
								onClick={() => updateConfig({ selectedSymbol: symbol })}
								className="size-10 active:scale-95"
							>
								{symbol}
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Force bangs call on first place */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0">
					<div className="space-y-1.5">
						<CardTitle>Force bangs call on first place</CardTitle>
						<CardDescription>{`Force bangs calling to be on first place like "${config.selectedSymbol}g what is cat?".`}</CardDescription>
					</div>
					<Switch
						size="lg"
						checked={config.forceBangsFirst}
						onCheckedChange={(val) => updateConfig({ forceBangsFirst: val })}
					/>
				</CardHeader>
			</Card>

			{/* Use store bangs */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0">
					<div className="space-y-1.5">
						<CardTitle>Use store bangs</CardTitle>
						<CardDescription>
							Use store bangs preset lists to bangs.
						</CardDescription>
					</div>
					<Switch
						size="lg"
						checked={config.useStoreBangs}
						onCheckedChange={(val) => updateConfig({ useStoreBangs: val })}
					/>
				</CardHeader>
			</Card>
		</section>
	);
}

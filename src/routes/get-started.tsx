import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Check,
	Copy,
	Download,
	Loader2,
	SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { syncBangs } from "@/lib/bangs-sync";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/get-started")({
	component: GetStartedPage,
});

const browserUrls = [
	{
		label: "Search URL",
		value: "https://cuzbangs.iydheko.site/go?q=%s",
		field: "search",
	},
	{
		label: "Suggestion URL",
		value: "https://cuzbangs.iydheko.site/suggestions?q=%s",
		field: "suggest",
	},
];

const steps = ["Info", "Downloading", "Applying", "Done"] as const;
type SetupStep = (typeof steps)[number];

function GetStartedPage() {
	const { isConsented, acceptConsent } = useApp();
	const [currentStep, setCurrentStep] = useState<SetupStep>(
		isConsented ? "Done" : "Info",
	);
	const [copiedField, setCopiedField] = useState<string | null>(null);

	const handleAgree = async () => {
		setCurrentStep("Downloading");
		await Promise.all([
			new Promise((resolve) => setTimeout(resolve, 500)),
			syncBangs({ force: true }),
		]);
		setCurrentStep("Applying");
		await new Promise((resolve) => setTimeout(resolve, 500));
		acceptConsent();
		setCurrentStep("Done");
	};

	const copyToClipboard = (text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	};

	const currentStepIndex = steps.indexOf(currentStep);
	const isWorking = currentStep === "Downloading" || currentStep === "Applying";
	const isFinished = currentStep === "Done";

	return (
		<main className="min-h-screen max-w-4xl mx-auto mt-28 px-4 pb-20">
			<section className="space-y-8">
				<div className="space-y-3">
					<h1 className="text-3xl font-semibold tracking-tight">Get started</h1>
					<p className="max-w-2xl text-muted-foreground">
						One-time setup for local bang data and browser search URLs.
					</p>
				</div>

				<div className="space-y-4">
					<div className="grid grid-cols-4 gap-2 text-sm font-medium">
						{steps.map((step, index) => (
							<div
								key={step}
								className={cn(
									"truncate text-muted-foreground",
									index <= currentStepIndex && "text-foreground",
								)}
							>
								{step}
							</div>
						))}
					</div>
					<div className="grid grid-cols-3 gap-2">
						{steps.slice(0, -1).map((step, index) => (
							<div
								key={step}
								className={cn(
									"h-1.5 rounded-full bg-muted transition-colors",
									index < currentStepIndex && "bg-primary",
									index === currentStepIndex && "bg-primary/50",
								)}
							/>
						))}
					</div>
				</div>

				<Card>
					{currentStep === "Info" && (
						<>
							<CardHeader>
								<CardTitle>Before we download</CardTitle>
								<CardDescription>
									cuzbangs needs to sync bang data into this browser once.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid gap-3">
									{[
										"Bangs data is stored locally.",
										"No personal data collection.",
										"Search history tracking can be disabled.",
										"Internet is needed for the initial sync.",
									].map((item) => (
										<div key={item} className="flex items-start gap-3">
											<Check className="mt-0.5 size-4 text-primary" />
											<p className="text-sm text-muted-foreground">{item}</p>
										</div>
									))}
								</div>
								<div className="grid gap-2 sm:grid-cols-2">
									<Button variant="outline" asChild>
										<Link to="/">Cancel</Link>
									</Button>
									<Button onClick={handleAgree}>
										I Agree
										<Download />
									</Button>
								</div>
							</CardContent>
						</>
					)}

					{currentStep === "Downloading" && (
						<>
							<CardHeader>
								<CardTitle>Downloading bang data</CardTitle>
								<CardDescription>
									Fetching the latest store data for local redirects.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-md border bg-muted/20">
									<Loader2 className="size-10 animate-spin text-primary" />
									<p className="text-sm text-muted-foreground">
										Downloading bangs...
									</p>
								</div>
							</CardContent>
						</>
					)}

					{currentStep === "Applying" && (
						<>
							<CardHeader>
								<CardTitle>Applying setup</CardTitle>
								<CardDescription>
									Saving consent and preparing cuzbangs for use.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-md border bg-muted/20">
									<Loader2 className="size-10 animate-spin text-primary" />
									<p className="text-sm text-muted-foreground">
										Applying settings...
									</p>
								</div>
							</CardContent>
						</>
					)}

					{isFinished && (
						<>
							<CardHeader>
								<CardTitle>Done</CardTitle>
								<CardDescription>
									Copy these into your browser custom search engine settings.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									{browserUrls.map((url) => (
										<div key={url.field} className="space-y-2">
											<Label>{url.label}</Label>
											<div className="flex items-center gap-2">
												<div className="flex h-10 w-full items-center overflow-x-auto whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-1 text-sm">
													{url.value}
												</div>
												<Button
													size="icon"
													variant="outline"
													onClick={() => copyToClipboard(url.value, url.field)}
												>
													{copiedField === url.field ? (
														<Check className="size-4 text-green-500" />
													) : (
														<Copy className="size-4" />
													)}
												</Button>
											</div>
										</div>
									))}
								</div>
								<div className="grid gap-2 sm:grid-cols-2">
									<Button variant="outline" asChild>
										<Link to="/settings" search={{ tab: "setup" }}>
											View later
											<SlidersHorizontal />
										</Link>
									</Button>
									<Button asChild>
										<Link to="/">
											Start searching
											<ArrowRight />
										</Link>
									</Button>
								</div>
							</CardContent>
						</>
					)}
				</Card>

				<div className="rounded-lg border bg-muted/15 p-4 text-sm text-muted-foreground">
					{isWorking
						? "Keep this tab open until setup finishes."
						: isFinished
							? "You can revisit these URLs from Settings -> Setup."
							: "Nothing downloads until you agree."}
				</div>
			</section>
		</main>
	);
}

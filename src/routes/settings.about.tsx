import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, ExternalLink, Github, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/settings/about")({
	component: AboutPage,
});

function AboutPage() {
	const [copiedField, setCopiedField] = useState<string | null>(null);

	const copyToClipboard = (text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	};

	return (
		<section className="w-full space-y-6">
			{/* Configuration */}
			<Card>
				<CardHeader>
					<CardTitle>Configuration</CardTitle>
					<CardDescription>
						URLs to configure your browser's search engine
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label>Search URL</Label>
						<div className="flex items-center space-x-2">
							<div className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
								https://cuzbangs.iydheko.site/go?q=%s
							</div>
							<Button
								size="icon"
								variant="outline"
								onClick={() =>
									copyToClipboard(
										"https://cuzbangs.iydheko.site/go?q=%s",
										"search",
									)
								}
							>
								{copiedField === "search" ? (
									<Check className="h-4 w-4 text-green-500" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>

					<div className="space-y-2">
						<Label>Suggestion URL</Label>
						<div className="flex items-center space-x-2">
							<div className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
								https://cuzbangs.iydheko.site/suggestions?q=%s
							</div>
							<Button
								size="icon"
								variant="outline"
								onClick={() =>
									copyToClipboard(
										"https://cuzbangs.iydheko.site/suggestions?q=%s",
										"suggest",
									)
								}
							>
								{copiedField === "suggest" ? (
									<Check className="h-4 w-4 text-green-500" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Links */}
			<Card>
				<CardHeader>
					<CardTitle>Links</CardTitle>
					<CardDescription>
						Check out the project and get involved
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-3">
					<Button variant="outline" asChild>
						<a
							href="https://github.com/ferdinankurnian/cuzbangs"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Github />
							GitHub
							<ExternalLink className="size-3" />
						</a>
					</Button>
					<Button variant="outline" asChild>
						<a
							href="https://iydheko.site"
							target="_blank"
							rel="noopener noreferrer"
						>
							Website
							<ExternalLink className="size-3" />
						</a>
					</Button>
				</CardContent>
			</Card>

			{/* Credits */}
			<Card>
				<CardHeader>
					<CardTitle>Credits</CardTitle>
					<CardDescription>
						The people and tools behind cuzbangs
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4">
						<img
							src="https://github.com/ferdinankurnian.png"
							alt="Creator"
							className="size-12 rounded-full"
						/>
						<div>
							<p className="font-medium">Ferdinan Kurnian</p>
							<p className="text-sm text-muted-foreground">
								Creator & Developer
							</p>
						</div>
					</div>
					<Separator />
					<div className="text-sm text-muted-foreground space-y-1">
						<p>Built with React, TanStack Router, and shadcn/ui</p>
						<p>Styled with Tailwind CSS</p>
					</div>
				</CardContent>
			</Card>

			{/* Footer */}
			<div className="text-center text-sm text-muted-foreground py-4">
				<p className="flex items-center justify-center gap-1">
					Made with <Heart className="size-4 text-red-500 fill-red-500" /> by
					iydheko
				</p>
				<p className="mt-1">© 2026 cuzbangs. All rights reserved.</p>
			</div>
		</section>
	);
}

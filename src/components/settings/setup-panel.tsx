import { Check, Copy } from "lucide-react";
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

const searchUrl = "https://cuzbangs.iydheko.site/go?q=%s";
const suggestionUrl = "https://cuzbangs.iydheko.site/suggestions?q=%s";

export function SetupPanel() {
	const [copiedField, setCopiedField] = useState<string | null>(null);

	const copyToClipboard = (text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	};

	return (
		<section className="w-full space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Search Engine URLs</CardTitle>
					<CardDescription>
						Use these when adding cuzbangs as a custom search engine.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label>Search URL</Label>
						<div className="flex items-center space-x-2">
							<div className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
								{searchUrl}
							</div>
							<Button
								size="icon"
								variant="outline"
								onClick={() => copyToClipboard(searchUrl, "search")}
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
								{suggestionUrl}
							</div>
							<Button
								size="icon"
								variant="outline"
								onClick={() => copyToClipboard(suggestionUrl, "suggest")}
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
		</section>
	);
}

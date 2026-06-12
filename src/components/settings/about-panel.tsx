import { ExternalLink, Github, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function AboutPanel() {
	return (
		<section className="w-full space-y-6">
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

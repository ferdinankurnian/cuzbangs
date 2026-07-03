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
			{/* What is cuzbangs */}
			<Card>
				<CardContent className="space-y-1.5">
					<p className="text-2xl font-semibold text-white [letter-spacing:-0.05em]">
						cuzbangs. cuz it bangs
					</p>
					<p className="text-muted-foreground">A redirect engine.</p>
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
							href="https://twitter.com/iydheko"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
							</svg>
							Twitter
							<ExternalLink className="size-3" />
						</a>
					</Button>
					<Button variant="outline" asChild>
						<a
							href="https://iydheko.dev"
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
							<p className="text-sm text-muted-foreground">Developer</p>
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

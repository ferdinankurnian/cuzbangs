import { ArrowRight, Database, Globe, Search, Zap } from "lucide-react";

const steps = [
	{
		title: "Your request",
		description: "Type bangs and queries on address bar.",
	},
	{
		title: "Processing..",
		description: "The browser redirects you, not us.",
	},
	{
		title: "Redirected",
		description: "Voilà, you're just redirected.",
	},
];

export function HowItWorks() {
	return (
		<section className="px-6 py-16 md:py-20 space-y-10">
			<div className="space-y-3">
				<h2 className="text-3xl md:text-4xl font-semibold text-white [letter-spacing:-0.05em]">
					What is cuzbangs?
				</h2>
				<p className="text-neutral-400 max-w-2xl leading-relaxed text-sm md:text-base">
					cuzbangs is a redirect engine that lets you search any site on the web using bangs, skipping homepages and jumping straight to the search results.
				</p>
			</div>

			<div className="flex flex-col md:flex-row gap-6 md:gap-4 md:items-center">
				{/* Step 1 — Your request */}
				<StepCard title={steps[0].title} description={steps[0].description} tilt="-rotate-2">
					<div className="flex items-center gap-2.5 rounded-md border bg-black/40 px-3.5 h-11 text-sm text-white">
						<Search className="size-4 text-muted-foreground shrink-0" />
						<span>!x iydheko</span>
					</div>
				</StepCard>

				<StepArrow />

				{/* Step 2 — Processing */}
				<StepCard title={steps[1].title} description={steps[1].description} tilt="rotate-2">
					<div className="flex items-center gap-3 w-full">
						{[Zap, Database, Globe].map((Icon, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: static icon set
								key={i}
								className="flex items-center justify-center h-11 flex-1 rounded-md border bg-black/40"
							>
								<Icon className="size-4.5 text-white" />
							</div>
						))}
					</div>
				</StepCard>

				<StepArrow />

				{/* Step 3 — Redirected */}
				<StepCard title={steps[2].title} description={steps[2].description} tilt="-rotate-1">
					<div className="flex items-center gap-2.5 rounded-md border bg-black/40 px-3.5 h-11 text-sm">
						<Globe className="size-4 text-muted-foreground shrink-0" />
						<span className="truncate">
							<span className="text-white font-medium">x.com</span>
							<span className="text-muted-foreground">/search?q=iydheko</span>
						</span>
					</div>
				</StepCard>
			</div>
		</section>
	);
}

function StepCard({
	title,
	description,
	children,
	tilt = "",
}: {
	title: string;
	description: string;
	children: React.ReactNode;
	tilt?: string;
}) {
	return (
		<div className={`flex flex-col gap-6 rounded-2xl border bg-black/40 p-6 flex-1 transition-transform duration-300 hover:rotate-0 hover:scale-[1.03] ${tilt}`}>
			<div className="space-y-1">
				<h3 className="text-white font-medium">{title}</h3>
				<p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
			</div>
			{children}
		</div>
	);
}

function StepArrow() {
	return (
		<ArrowRight className="size-5 text-neutral-600 mx-auto rotate-90 md:rotate-0 shrink-0" />
	);
}

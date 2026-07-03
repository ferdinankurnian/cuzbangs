import { ArrowDown, Globe, Search } from "lucide-react";

export function SubRoutes() {
	return (
		<section className="px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
			<div className="w-full max-w-sm mx-auto rounded-2xl border bg-black/40 px-6 py-12 space-y-3 overflow-hidden -rotate-2 transition-transform duration-300 hover:rotate-0 hover:scale-[1.02]">
				<div className="flex items-center gap-2.5 rounded-l-md border-y border-l bg-black/40 px-3.5 h-11 text-sm text-white -mr-10 pr-10">
					<Search className="size-4 text-muted-foreground shrink-0" />
					<span className="truncate">!gh/repo cuzbangs</span>
				</div>

				<div className="flex items-center justify-center gap-1.5 py-1 text-neutral-500 pr-10">
					<span className="text-xs">to</span>
					<ArrowDown className="size-4" />
				</div>

				<div className="flex items-center gap-2.5 rounded-l-md border-y border-l bg-black/40 px-3.5 h-11 text-sm -mr-10 pr-10">
					<Globe className="size-4 text-muted-foreground shrink-0" />
					<span className="text-white truncate">
						github.com/search?q=cuzbangs&type=repositories
					</span>
				</div>
			</div>

			<div className="space-y-4 text-center md:text-left">
				<h2 className="text-3xl md:text-4xl font-semibold text-white [letter-spacing:-0.05em]">
					Sub-routes
				</h2>
				<p className="text-neutral-400 leading-relaxed">
					Sub-routes bring more pages within reach — redirect and search deeper
					pages of a site, not just the homepage.
				</p>
			</div>
		</section>
	);
}

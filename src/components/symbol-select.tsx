import { useState } from "react";
import { cn } from "@/lib/utils";

const SYMBOLS = ["!", "@", "#", "$", "."] as const;
const QUERY_SUFFIX = "gi calico cat";

export function SymbolSelect() {
	const [symbol, setSymbol] = useState<(typeof SYMBOLS)[number]>("!");

	return (
		<section className="px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
			<div className="w-full max-w-sm mx-auto rounded-2xl border bg-black/40 px-6 py-6 space-y-6 rotate-2 transition-transform duration-300 hover:rotate-0 hover:scale-[1.02]">
				<p className="py-12 text-2xl md:text-3xl font-semibold text-white text-center [letter-spacing:-0.03em]">
					{symbol}
					{QUERY_SUFFIX}
				</p>
				<div className="flex justify-center gap-2">
					{SYMBOLS.map((s) => (
						<button
							key={s}
							type="button"
							onClick={() => setSymbol(s)}
							className={cn(
								"flex items-center justify-center size-11 rounded-lg border text-sm font-medium transition-colors",
								symbol === s
									? "bg-white text-black border-white"
									: "bg-black/40 text-neutral-400 hover:border-white/25 hover:text-white",
							)}
						>
							{s}
						</button>
					))}
				</div>
			</div>

			<div className="space-y-4 text-center md:text-left">
				<h2 className="text-3xl md:text-4xl font-semibold text-white [letter-spacing:-0.05em]">
					Choose trigger prefix you like
				</h2>
				<p className="text-neutral-400 leading-relaxed">
					Not everyone likes typing "!" — pick @, #, $, or . instead. Same
					bangs, same speed, just triggered your way.
				</p>
			</div>
		</section>
	);
}

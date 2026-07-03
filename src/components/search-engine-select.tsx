const engines = [
	{ name: "Google", src: "/google.svg", tilt: "-rotate-3" },
	{ name: "Bing", src: "/bing.svg", tilt: "rotate-2" },
	{ name: "DuckDuckGo", src: "/duckduckgo.svg", tilt: "rotate-2" },
	{ name: "Kagi", src: "/kagi-logo.png", tilt: "-rotate-2" },
];

export function SearchEngineSelect() {
	return (
		<section className="px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
			<div className="grid grid-cols-2 gap-5 w-fit mx-auto">
				{engines.map((engine) => (
					<div
						key={engine.name}
						className={`relative flex items-center justify-center size-36 rounded-2xl border bg-black/40 overflow-hidden transition-transform duration-300 hover:rotate-0 hover:scale-105 ${engine.tilt}`}
					>
						<img
							src={engine.src}
							alt={engine.name}
							className="relative size-16 object-contain"
						/>
					</div>
				))}
			</div>

			<div className="space-y-4 text-center md:text-left">
				<h2 className="text-3xl md:text-4xl font-semibold text-white [letter-spacing:-0.05em]">
					Select your default search engine preference
				</h2>
				<p className="text-neutral-400 leading-relaxed">
					Choose from Google, Bing, Kagi, and DuckDuckGo. You can also bring
					your own search engine.
				</p>
			</div>
		</section>
	);
}

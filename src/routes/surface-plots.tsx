import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Dices, Download } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { SurfacePlotPoster } from "../components/SurfacePlotPoster";
import { PLOTS_POSTER } from "../util/surfacePlots";

export const Route = createFileRoute("/surface-plots")({
	component: SurfacePlotsPage,
});

function SurfacePlotsPage() {
	const [seed, setSeed] = useState(11);
	const [density, setDensity] = useState(30);
	const [showFill, setShowFill] = useState(true);
	const svgRef = useRef<SVGSVGElement>(null);

	const downloadPng = useCallback(() => {
		const svg = svgRef.current;
		if (!svg) return;
		const clone = svg.cloneNode(true) as SVGSVGElement;
		clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		clone.setAttribute("width", String(PLOTS_POSTER.width));
		clone.setAttribute("height", String(PLOTS_POSTER.height));

		const source = new XMLSerializer().serializeToString(clone);
		const svgUrl = URL.createObjectURL(
			new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
		);
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = PLOTS_POSTER.width;
			canvas.height = PLOTS_POSTER.height;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.fillStyle = "#111110";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(svgUrl);
			canvas.toBlob((blob) => {
				if (!blob) return;
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob);
				a.download = `surface-plots-${seed}.png`;
				a.click();
				URL.revokeObjectURL(a.href);
			}, "image/png");
		};
		img.src = svgUrl;
	}, [seed]);

	return (
		<div className="flex h-screen w-screen overflow-hidden bg-slate-950">
			<div className="flex min-w-0 flex-1 items-center justify-center p-6 md:p-8">
				<div
					className="h-full overflow-hidden rounded-sm shadow-2xl shadow-black/60"
					style={{
						aspectRatio: `${PLOTS_POSTER.width} / ${PLOTS_POSTER.height}`,
						maxWidth: "100%",
					}}
				>
					<SurfacePlotPoster
						svgRef={svgRef}
						seed={seed}
						density={density}
						showFill={showFill}
					/>
				</div>
			</div>

			<aside className="w-80 shrink-0 overflow-y-auto border-l border-slate-800 bg-slate-900/80 p-6">
				<Link
					to="/"
					className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
				>
					<ArrowLeft size={16} />
					Back to sandbox
				</Link>

				<h1 className="text-xl font-semibold text-white">Surface Plots</h1>
				<p className="mt-2 mb-6 text-sm leading-relaxed text-slate-400">
					Axonometric wireframe terrains (years × countries × value) with a mint
					projection wall, in the style of a dark data-viz poster.
				</p>

				<label className="mb-4 block">
					<div className="mb-1.5 flex items-baseline justify-between">
						<span className="text-xs font-medium uppercase tracking-wide text-slate-300">
							Wireframe density
						</span>
						<span className="font-mono text-xs tabular-nums text-cyan-400">
							{density}
						</span>
					</div>
					<input
						type="range"
						min={12}
						max={48}
						step={1}
						value={density}
						onChange={(e) => setDensity(Number.parseInt(e.target.value, 10))}
						className="halftone-range w-full"
					/>
				</label>

				<label className="mb-4 block">
					<div className="mb-1.5 flex items-baseline justify-between">
						<span className="text-xs font-medium uppercase tracking-wide text-slate-300">
							Seed
						</span>
						<span className="font-mono text-xs tabular-nums text-cyan-400">
							{seed}
						</span>
					</div>
					<input
						type="range"
						min={0}
						max={999}
						step={1}
						value={seed}
						onChange={(e) => setSeed(Number.parseInt(e.target.value, 10))}
						className="halftone-range w-full"
					/>
				</label>

				<div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-300">
					<span>Mint wall</span>
					<button
						type="button"
						onClick={() => setShowFill((v) => !v)}
						className={`h-5 w-9 rounded-full transition-colors ${
							showFill ? "bg-cyan-500" : "bg-slate-700"
						}`}
						aria-pressed={showFill}
						aria-label="Toggle mint wall"
					>
						<span
							className="block h-4 w-4 rounded-full bg-white transition-transform"
							style={{ transform: `translateX(${showFill ? 18 : 2}px)` }}
						/>
					</button>
				</div>

				<div className="mt-6 flex gap-2">
					<button
						type="button"
						onClick={() => setSeed(Math.floor(Math.random() * 100000))}
						className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-cyan-400"
					>
						<Dices size={16} />
						Shuffle
					</button>
					<button
						type="button"
						onClick={downloadPng}
						className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
					>
						<Download size={16} />
						PNG
					</button>
				</div>
			</aside>
		</div>
	);
}

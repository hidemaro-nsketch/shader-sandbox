import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Dices, Download } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { PaperPoster } from "../components/PaperPoster";
import { createPaperPoster, POSTER } from "../util/paperPoster";

export const Route = createFileRoute("/paper-chain")({
	component: PaperChainPage,
});

type Params = {
	seed: number;
	figures: number;
	wobble: number;
	wordmark: string;
	showLabels: boolean;
	showGrain: boolean;
};

const DEFAULT_PARAMS: Params = {
	seed: 7,
	figures: 9,
	wobble: 12,
	wordmark: "Collab",
	showLabels: true,
	showGrain: true,
};

function PaperChainPage() {
	const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
	const svgRef = useRef<SVGSVGElement>(null);

	const set = <K extends keyof Params>(key: K, value: Params[K]) =>
		setParams((p) => ({ ...p, [key]: value }));

	const layout = useMemo(
		() =>
			createPaperPoster({
				seed: params.seed,
				figureCount: params.figures,
				wordmark: params.wordmark,
			}),
		[params.seed, params.figures, params.wordmark],
	);

	const shuffle = () => set("seed", Math.floor(Math.random() * 100000));

	const downloadPng = useCallback(() => {
		const svg = svgRef.current;
		if (!svg) return;
		const clone = svg.cloneNode(true) as SVGSVGElement;
		clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		clone.setAttribute("width", String(POSTER.width));
		clone.setAttribute("height", String(POSTER.height));

		const source = new XMLSerializer().serializeToString(clone);
		const svgUrl = URL.createObjectURL(
			new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
		);
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = POSTER.width;
			canvas.height = POSTER.height;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(svgUrl);
			canvas.toBlob((blob) => {
				if (!blob) return;
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob);
				a.download = `paper-chain-${params.seed}.png`;
				a.click();
				URL.revokeObjectURL(a.href);
			}, "image/png");
		};
		img.src = svgUrl;
	}, [params.seed]);

	return (
		<div className="flex h-screen w-screen overflow-hidden bg-slate-950">
			<div className="flex min-w-0 flex-1 items-center justify-center p-6 md:p-10">
				<div
					className="h-full overflow-hidden rounded-sm shadow-2xl shadow-black/60"
					style={{
						aspectRatio: `${POSTER.width} / ${POSTER.height}`,
						maxWidth: "100%",
					}}
				>
					<PaperPoster
						svgRef={svgRef}
						layout={layout}
						wordmark={params.wordmark}
						wobble={params.wobble}
						showLabels={params.showLabels}
						showGrain={params.showGrain}
						seed={params.seed}
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

				<h1 className="text-xl font-semibold text-white">Paper Chain</h1>
				<p className="mt-2 mb-6 text-sm leading-relaxed text-slate-400">
					Cut-paper human chain poster generator. Every seed rearranges the
					figures, pixel patches and labels.
				</p>

				<Slider
					label="Figures"
					value={params.figures}
					min={5}
					max={16}
					step={1}
					format={(v) => String(Math.round(v))}
					onChange={(v) => set("figures", Math.round(v))}
				/>
				<Slider
					label="Wobble"
					value={params.wobble}
					min={0}
					max={26}
					step={1}
					format={(v) => String(Math.round(v))}
					onChange={(v) => set("wobble", Math.round(v))}
				/>
				<Slider
					label="Seed"
					value={params.seed}
					min={0}
					max={999}
					step={1}
					format={(v) => String(Math.round(v))}
					onChange={(v) => set("seed", Math.round(v))}
				/>

				<label className="mb-4 block">
					<span className="text-xs font-medium text-slate-300 uppercase tracking-wide">
						Wordmark
					</span>
					<input
						type="text"
						value={params.wordmark}
						maxLength={16}
						onChange={(e) => set("wordmark", e.target.value)}
						className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
					/>
				</label>

				<Toggle
					label="Labels"
					value={params.showLabels}
					onChange={(v) => set("showLabels", v)}
				/>
				<Toggle
					label="Grain"
					value={params.showGrain}
					onChange={(v) => set("showGrain", v)}
				/>

				<div className="mt-6 flex gap-2">
					<button
						type="button"
						onClick={shuffle}
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

function Slider(props: {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	onChange: (v: number) => void;
	format?: (v: number) => string;
}) {
	const { label, value, min, max, step, onChange, format } = props;
	return (
		<label className="mb-4 block">
			<div className="mb-1.5 flex items-baseline justify-between">
				<span className="text-xs font-medium text-slate-300 uppercase tracking-wide">
					{label}
				</span>
				<span className="font-mono text-xs text-cyan-400 tabular-nums">
					{format ? format(value) : value.toFixed(2)}
				</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(Number.parseFloat(e.target.value))}
				className="halftone-range w-full"
			/>
		</label>
	);
}

function Toggle(props: {
	label: string;
	value: boolean;
	onChange: (v: boolean) => void;
}) {
	const { label, value, onChange } = props;
	return (
		<div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-300">
			<span>{label}</span>
			<button
				type="button"
				onClick={() => onChange(!value)}
				className={`h-5 w-9 rounded-full transition-colors ${
					value ? "bg-cyan-500" : "bg-slate-700"
				}`}
				aria-pressed={value}
				aria-label={label}
			>
				<span
					className="block h-4 w-4 rounded-full bg-white transition-transform"
					style={{ transform: `translateX(${value ? 18 : 2}px)` }}
				/>
			</button>
		</div>
	);
}

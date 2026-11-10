import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
	type WireframeParams,
	WireframeTorus,
} from "../components/WireframeTorus";
import { CAD_POSTER } from "../util/wireframeTorus";

export const Route = createFileRoute("/wireframe")({
	component: WireframePage,
});

const DEFAULTS: WireframeParams = {
	azimuth: -32,
	elevation: 20,
	segments: 22,
	sides: 12,
	showGrid: true,
	showDimensions: true,
};

function WireframePage() {
	const [params, setParams] = useState<WireframeParams>(DEFAULTS);
	const svgRef = useRef<SVGSVGElement>(null);

	const set = <K extends keyof WireframeParams>(
		key: K,
		value: WireframeParams[K],
	) => setParams((p) => ({ ...p, [key]: value }));

	const downloadPng = useCallback(() => {
		const svg = svgRef.current;
		if (!svg) return;
		const clone = svg.cloneNode(true) as SVGSVGElement;
		clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		clone.setAttribute("width", String(CAD_POSTER.width));
		clone.setAttribute("height", String(CAD_POSTER.height));

		const source = new XMLSerializer().serializeToString(clone);
		const svgUrl = URL.createObjectURL(
			new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
		);
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = CAD_POSTER.width;
			canvas.height = CAD_POSTER.height;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.fillStyle = "#151513";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(svgUrl);
			canvas.toBlob((blob) => {
				if (!blob) return;
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob);
				a.download = "wireframe-torus.png";
				a.click();
				URL.revokeObjectURL(a.href);
			}, "image/png");
		};
		img.src = svgUrl;
	}, []);

	return (
		<div className="flex h-screen w-screen overflow-hidden bg-slate-950">
			<div className="flex min-w-0 flex-1 items-center justify-center p-6 md:p-8">
				<div
					className="h-full overflow-hidden rounded-sm shadow-2xl shadow-black/60"
					style={{
						aspectRatio: `${CAD_POSTER.width} / ${CAD_POSTER.height}`,
						maxWidth: "100%",
					}}
				>
					<WireframeTorus svgRef={svgRef} {...params} />
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

				<h1 className="text-xl font-semibold text-white">Wireframe Torus</h1>
				<p className="mt-2 mb-6 text-sm leading-relaxed text-slate-400">
					CAD-style wireframe render: transparent housing, floor grid, mm
					dimensions and a glowing hub part.
				</p>

				<Slider
					label="Azimuth"
					value={params.azimuth}
					min={-90}
					max={90}
					step={1}
					suffix="°"
					onChange={(v) => set("azimuth", Math.round(v))}
				/>
				<Slider
					label="Elevation"
					value={params.elevation}
					min={2}
					max={60}
					step={1}
					suffix="°"
					onChange={(v) => set("elevation", Math.round(v))}
				/>
				<Slider
					label="Meridians"
					value={params.segments}
					min={8}
					max={48}
					step={1}
					onChange={(v) => set("segments", Math.round(v))}
				/>
				<Slider
					label="Tube rings"
					value={params.sides}
					min={6}
					max={24}
					step={1}
					onChange={(v) => set("sides", Math.round(v))}
				/>

				<Toggle
					label="Floor grid"
					value={params.showGrid}
					onChange={(v) => set("showGrid", v)}
				/>
				<Toggle
					label="Dimensions"
					value={params.showDimensions}
					onChange={(v) => set("showDimensions", v)}
				/>

				<button
					type="button"
					onClick={downloadPng}
					className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
				>
					<Download size={16} />
					PNG
				</button>
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
	suffix?: string;
	onChange: (v: number) => void;
}) {
	const { label, value, min, max, step, suffix, onChange } = props;
	return (
		<label className="mb-4 block">
			<div className="mb-1.5 flex items-baseline justify-between">
				<span className="text-xs font-medium uppercase tracking-wide text-slate-300">
					{label}
				</span>
				<span className="font-mono text-xs tabular-nums text-cyan-400">
					{value}
					{suffix ?? ""}
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

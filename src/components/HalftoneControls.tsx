import { Link } from "@tanstack/react-router";
import { ArrowLeft, RotateCcw, Upload } from "lucide-react";
import { type ChangeEvent, type ReactNode, useCallback, useRef } from "react";
import { HALFTONE_SHAPES, type HalftoneShape } from "../util/halftone";

export interface HalftoneParamValues {
	cells: number;
	dotScale: number;
	angle: number;
	contrast: number;
	brightness: number;
	invert: boolean;
	shape: HalftoneShape;
	colorMode: "mono" | "color";
	tint: string;
	bgColor: string;
}

interface Props {
	params: HalftoneParamValues;
	onChange: <K extends keyof HalftoneParamValues>(
		key: K,
		value: HalftoneParamValues[K],
	) => void;
	onImageUpload: (file: File) => void;
	onResetSample: () => void;
	imageName: string;
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
		<label className="block mb-4">
			<div className="flex justify-between items-baseline mb-1.5">
				<span className="text-xs font-medium text-slate-300 uppercase tracking-wide">
					{label}
				</span>
				<span className="text-xs text-cyan-400 font-mono tabular-nums">
					{format ? format(value) : value.toFixed(2)}
				</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(parseFloat(e.target.value))}
				className="halftone-range w-full"
			/>
		</label>
	);
}

function Segmented<T extends string>(props: {
	label: string;
	value: T;
	options: { value: T; label: string }[];
	onChange: (v: T) => void;
}) {
	const { label, value, options, onChange } = props;
	return (
		<div className="mb-4">
			<div className="text-xs font-medium text-slate-300 uppercase tracking-wide mb-1.5">
				{label}
			</div>
			<div className="flex bg-slate-950/60 rounded-lg p-0.5 border border-slate-700">
				{options.map((opt) => (
					<button
						key={opt.value}
						type="button"
						onClick={() => onChange(opt.value)}
						className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
							value === opt.value
								? "bg-cyan-500 text-slate-900 shadow"
								: "text-slate-400 hover:text-slate-200"
						}`}
					>
						{opt.label}
					</button>
				))}
			</div>
		</div>
	);
}

function ShapeIcon({ shape }: { shape: HalftoneShape }) {
	// 24x24 viewBox, shape centered at (12,12) with radius ~8.
	switch (shape) {
		case "circle":
			return <circle cx="12" cy="12" r="8" fill="currentColor" />;
		case "square":
			return <rect x="4" y="4" width="16" height="16" fill="currentColor" />;
		case "diamond":
			return <path d="M12 3 L21 12 L12 21 L3 12 Z" fill="currentColor" />;
		case "hexagon":
			return (
				<path
					d="M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z"
					fill="currentColor"
				/>
			);
		case "cross":
			return (
				<path
					d="M9 3 H15 V9 H21 V15 H15 V21 H9 V15 H3 V9 H9 Z"
					fill="currentColor"
				/>
			);
		case "line":
			return <rect x="3" y="9" width="18" height="6" fill="currentColor" />;
		case "ring":
			return (
				<circle
					cx="12"
					cy="12"
					r="6"
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
				/>
			);
		case "triangle":
			return <path d="M12 4 L20 20 L4 20 Z" fill="currentColor" />;
		default:
			return null;
	}
}

function ShapeGrid(props: {
	label: string;
	value: HalftoneShape;
	onChange: (v: HalftoneShape) => void;
}) {
	const { label, value, onChange } = props;
	return (
		<div className="mb-4">
			<div className="text-xs font-medium text-slate-300 uppercase tracking-wide mb-1.5">
				{label}
			</div>
			<div className="grid grid-cols-4 gap-1.5">
				{HALFTONE_SHAPES.map((shape) => (
					<button
						key={shape}
						type="button"
						onClick={() => onChange(shape)}
						aria-label={shape}
						aria-pressed={value === shape}
						className={`flex items-center justify-center aspect-square rounded-lg border transition-all ${
							value === shape
								? "bg-cyan-500 text-slate-900 border-cyan-400 shadow"
								: "bg-slate-950/60 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600"
						}`}
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							role="img"
							aria-hidden="true"
						>
							<ShapeIcon shape={shape} />
						</svg>
					</button>
				))}
			</div>
		</div>
	);
}

function Toggle(props: {
	label: string;
	value: boolean;
	onChange: (v: boolean) => void;
}) {
	const { label, value, onChange } = props;
	return (
		<div className="flex items-center justify-between mb-4">
			<span className="text-xs font-medium text-slate-300 uppercase tracking-wide">
				{label}
			</span>
			<button
				type="button"
				role="switch"
				aria-checked={value}
				onClick={() => onChange(!value)}
				className={`relative w-11 h-6 rounded-full transition-colors ${
					value ? "bg-cyan-500" : "bg-slate-700"
				}`}
			>
				<span
					className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
						value ? "translate-x-5" : "translate-x-0"
					}`}
				/>
			</button>
		</div>
	);
}

function ColorField(props: {
	label: string;
	value: string;
	onChange: (v: string) => void;
}) {
	const { label, value, onChange } = props;
	return (
		<label className="block mb-4">
			<div className="text-xs font-medium text-slate-300 uppercase tracking-wide mb-1.5">
				{label}
			</div>
			<div className="flex items-center gap-2 bg-slate-950/60 border border-slate-700 rounded-lg p-1.5">
				<input
					type="color"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
				/>
				<span className="text-xs font-mono text-slate-400 uppercase">
					{value}
				</span>
			</div>
		</label>
	);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="mb-6">
			<h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1.5">
				{title}
			</h3>
			{children}
		</section>
	);
}

export default function HalftoneControls({
	params,
	onChange,
	onImageUpload,
	onResetSample,
	imageName,
}: Props) {
	const fileRef = useRef<HTMLInputElement>(null);

	const handleFile = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) onImageUpload(file);
			e.target.value = "";
		},
		[onImageUpload],
	);

	return (
		<aside className="w-[360px] shrink-0 h-screen bg-slate-900/80 backdrop-blur-md border-l border-slate-700 flex flex-col">
			<div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
				<Link
					to="/"
					className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
					aria-label="Back to home"
				>
					<ArrowLeft size={18} />
				</Link>
				<h2 className="text-sm font-bold text-white tracking-tight">
					Halftone
				</h2>
			</div>

			<div className="flex-1 overflow-y-auto px-5 py-5">
				<Section title="Image">
					<div className="flex gap-2 mb-3">
						<button
							type="button"
							onClick={() => fileRef.current?.click()}
							className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-cyan-500 text-slate-900 hover:bg-cyan-400 transition-colors"
						>
							<Upload size={14} />
							Upload
						</button>
						<button
							type="button"
							onClick={onResetSample}
							className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
						>
							<RotateCcw size={14} />
							Sample
						</button>
					</div>
					<input
						ref={fileRef}
						type="file"
						accept="image/*"
						onChange={handleFile}
						className="hidden"
					/>
					<p className="text-[11px] text-slate-500 truncate">{imageName}</p>
				</Section>

				<Section title="Dot">
					<Slider
						label="Density"
						value={params.cells}
						min={10}
						max={250}
						step={1}
						onChange={(v) => onChange("cells", v)}
						format={(v) => v.toFixed(0)}
					/>
					<Slider
						label="Size"
						value={params.dotScale}
						min={0}
						max={1.5}
						step={0.01}
						onChange={(v) => onChange("dotScale", v)}
					/>
					<Slider
						label="Angle"
						value={params.angle}
						min={0}
						max={Math.PI}
						step={0.01}
						onChange={(v) => onChange("angle", v)}
						format={(v) => `${((v * 180) / Math.PI).toFixed(0)}°`}
					/>
					<Slider
						label="Randomness"
						value={params.randomness}
						min={0}
						max={1}
						step={0.01}
						onChange={(v) => onChange("randomness", v)}
					/>
					<ShapeGrid
						label="Shape"
						value={params.shape}
						onChange={(v) => onChange("shape", v)}
					/>
				</Section>

				<Section title="Tone">
					<Slider
						label="Contrast"
						value={params.contrast}
						min={0}
						max={2}
						step={0.01}
						onChange={(v) => onChange("contrast", v)}
					/>
					<Slider
						label="Brightness"
						value={params.brightness}
						min={-1}
						max={1}
						step={0.01}
						onChange={(v) => onChange("brightness", v)}
					/>
					<Toggle
						label="Invert"
						value={params.invert}
						onChange={(v) => onChange("invert", v)}
					/>
				</Section>

				<Section title="Color">
					<Segmented
						label="Mode"
						value={params.colorMode}
						options={[
							{ value: "mono", label: "Mono" },
							{ value: "color", label: "Color" },
						]}
						onChange={(v) => onChange("colorMode", v)}
					/>
					<ColorField
						label="Dot Color"
						value={params.tint}
						onChange={(v) => onChange("tint", v)}
					/>
					<ColorField
						label="Background"
						value={params.bgColor}
						onChange={(v) => onChange("bgColor", v)}
					/>
				</Section>
			</div>
		</aside>
	);
}

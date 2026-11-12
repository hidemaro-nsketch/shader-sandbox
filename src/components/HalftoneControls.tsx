import { RotateCcw, Upload } from "lucide-react";
import { type ChangeEvent, useCallback, useRef } from "react";
import { HALFTONE_SHAPES, type HalftoneShape } from "../util/halftone";
import {
	ActionButton,
	BackLink,
	PageTitle,
	Panel,
	Section,
	Segmented,
	Slider,
	Toggle,
} from "./ui/Controls";

export interface HalftoneParamValues {
	cells: number;
	dotScale: number;
	angle: number;
	randomness: number;
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

function ShapeIcon({ shape }: { shape: HalftoneShape }) {
	// 24x24 viewBox, shape centred at (12,12) with radius ~8.
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
			<div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em]">
				{label}
			</div>
			<div className="grid grid-cols-4 gap-px border border-black bg-black">
				{HALFTONE_SHAPES.map((shape) => (
					<button
						key={shape}
						type="button"
						onClick={() => onChange(shape)}
						aria-label={shape}
						aria-pressed={value === shape}
						className={`flex aspect-square items-center justify-center transition-colors ${
							value === shape
								? "bg-black text-white"
								: "bg-white text-black hover:bg-black/10"
						}`}
					>
						<svg
							width="16"
							height="16"
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

function ColorField(props: {
	label: string;
	value: string;
	onChange: (v: string) => void;
}) {
	const { label, value, onChange } = props;
	return (
		<label className="mb-4 block">
			<div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em]">
				{label}
			</div>
			<div className="flex items-center gap-2 border border-black p-1.5">
				<input
					type="color"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="h-7 w-9 cursor-pointer border border-black bg-white p-0"
				/>
				<span className="text-[11px] uppercase tabular-nums">{value}</span>
			</div>
		</label>
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
		<Panel>
			<BackLink />
			<PageTitle>Halftone</PageTitle>

			<Section title="Image">
				<div className="mb-2 flex gap-2">
					<ActionButton
						onClick={() => fileRef.current?.click()}
						icon={<Upload size={12} />}
					>
						Upload
					</ActionButton>
					<ActionButton
						onClick={onResetSample}
						icon={<RotateCcw size={12} />}
						variant="outline"
					>
						Sample
					</ActionButton>
				</div>
				<input
					ref={fileRef}
					type="file"
					accept="image/*"
					onChange={handleFile}
					className="hidden"
				/>
				<p className="truncate text-[11px] text-black/50">{imageName}</p>
			</Section>

			<Section title="Dot">
				<Slider
					label="Density"
					value={params.cells}
					min={10}
					max={250}
					step={1}
					format={(v) => v.toFixed(0)}
					onChange={(v) => onChange("cells", v)}
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
					format={(v) => `${((v * 180) / Math.PI).toFixed(0)}°`}
					onChange={(v) => onChange("angle", v)}
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
					label="Dot color"
					value={params.tint}
					onChange={(v) => onChange("tint", v)}
				/>
				<ColorField
					label="Background"
					value={params.bgColor}
					onChange={(v) => onChange("bgColor", v)}
				/>
			</Section>
		</Panel>
	);
}

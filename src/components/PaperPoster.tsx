import { type Ref, useId } from "react";
import {
	type Figure,
	type Label,
	PAPER_PALETTE,
	type Patch,
	POSTER,
	type PosterLayout,
} from "../util/paperPoster";

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
const SANS =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

type PaperPosterProps = {
	layout: PosterLayout;
	wordmark: string;
	/** Paper-cut edge displacement in viewBox units. */
	wobble: number;
	showLabels: boolean;
	showGrain: boolean;
	seed: number;
	svgRef?: Ref<SVGSVGElement>;
};

export function PaperPoster({
	layout,
	wordmark,
	wobble,
	showLabels,
	showGrain,
	seed,
	svgRef,
}: PaperPosterProps) {
	const { width, height } = POSTER;
	const uid = useId().replace(/:/g, "");
	const ids = {
		cut: `paper-cut-${uid}`,
		keyline: `keyline-${uid}`,
		edge: `figure-edge-${uid}`,
		grain: `grain-${uid}`,
		vignette: `vignette-${uid}`,
	};

	return (
		<svg
			ref={svgRef}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
			className="h-full w-full"
			role="img"
			aria-labelledby={`title-${uid}`}
		>
			<title id={`title-${uid}`}>Paper chain poster</title>
			<defs>
				{/* Hand-cut paper edge */}
				<filter id={ids.cut} x="-15%" y="-15%" width="130%" height="130%">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.05"
						numOctaves={2}
						seed={seed % 100}
						result="noise"
					/>
					<feDisplacementMap
						in="SourceGraphic"
						in2="noise"
						scale={wobble}
						xChannelSelector="R"
						yChannelSelector="G"
					/>
				</filter>

				{/* Cream keyline around the whole cut-out chain */}
				<filter id={ids.keyline} x="-20%" y="-20%" width="140%" height="140%">
					<feMorphology operator="dilate" radius={2.6} />
				</filter>

				{/* Dark cut edge between overlapping figures */}
				<filter id={ids.edge} x="-10%" y="-10%" width="120%" height="120%">
					<feMorphology
						in="SourceAlpha"
						operator="dilate"
						radius={1.8}
						result="fat"
					/>
					<feFlood floodColor={PAPER_PALETTE.bg} />
					<feComposite in2="fat" operator="in" />
				</filter>

				<filter id={ids.grain} x="0" y="0" width="100%" height="100%">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.9"
						numOctaves={3}
						stitchTiles="stitch"
						result="grain-noise"
					/>
					<feColorMatrix type="saturate" values="0" />
				</filter>

				<radialGradient id={ids.vignette} cx="50%" cy="48%" r="72%">
					<stop offset="55%" stopColor="#000" stopOpacity="0" />
					<stop offset="100%" stopColor="#000" stopOpacity="0.45" />
				</radialGradient>
			</defs>

			<rect width={width} height={height} fill={PAPER_PALETTE.bg} />

			{/* Pixel patches sit behind the chain */}
			<g>
				{layout.patches.map((patch) => (
					<PatchShape key={`${patch.x}-${patch.y}`} patch={patch} />
				))}
			</g>

			{/* Paper chain: cream keyline, then figures with dark cut edges */}
			<g filter={`url(#${ids.cut})`}>
				<g filter={`url(#${ids.keyline})`}>
					{layout.figures.map((figure) => (
						<FigureShape
							key={`outline-${figure.x}-${figure.y}`}
							figure={figure}
							color={PAPER_PALETTE.cream}
						/>
					))}
				</g>
				{layout.figures.map((figure) => (
					<g key={`figure-${figure.x}-${figure.y}`}>
						<g filter={`url(#${ids.edge})`}>
							<FigureShape figure={figure} color={PAPER_PALETTE.bg} />
						</g>
						<FigureShape figure={figure} color={figure.color} />
					</g>
				))}
			</g>

			{showLabels && (
				<g fontFamily={MONO} fontSize={11} fill={PAPER_PALETTE.cream}>
					{layout.labels.map((label) => (
						<LabelShape key={label.text} label={label} />
					))}
				</g>
			)}

			<Wordmark text={wordmark} />

			<rect
				width={width}
				height={height}
				fill={`url(#${ids.vignette})`}
				pointerEvents="none"
			/>

			{showGrain && (
				<rect
					width={width}
					height={height}
					filter={`url(#${ids.grain})`}
					opacity={0.14}
					style={{ mixBlendMode: "overlay" }}
					pointerEvents="none"
				/>
			)}
		</svg>
	);
}

function FigureShape({ figure, color }: { figure: Figure; color: string }) {
	const h = figure.height;
	const torsoW = 0.26 * h;
	const armW = 0.09 * h;
	const legW = 0.115 * h;
	const { handX, handY } = figure;
	return (
		<g stroke={color} fill="none" strokeLinecap="round" strokeLinejoin="round">
			<g
				transform={`translate(${figure.x} ${figure.y}) rotate(${figure.angle})`}
			>
				<circle cx={0} cy={-0.44 * h} r={0.1 * h} fill={color} stroke="none" />
				<line x1={0} y1={-0.34 * h} x2={0} y2={0.07 * h} strokeWidth={torsoW} />
				{/* Arms reach the shared hand point just below shoulder height */}
				<polyline
					points={`0,${-0.27 * h} ${-handX * 0.55},${-0.27 * h - (handY + 0.27 * h) * 0.3} ${-handX},${handY}`}
					strokeWidth={armW}
				/>
				<polyline
					points={`0,${-0.27 * h} ${handX * 0.55},${-0.27 * h - (handY + 0.27 * h) * 0.3} ${handX},${handY}`}
					strokeWidth={armW}
				/>
				<line
					x1={-0.05 * h}
					y1={0.05 * h}
					x2={-0.08 * h}
					y2={0.4 * h}
					strokeWidth={legW}
				/>
				<line
					x1={0.05 * h}
					y1={0.05 * h}
					x2={0.08 * h}
					y2={0.4 * h}
					strokeWidth={legW}
				/>
			</g>
		</g>
	);
}

function PatchShape({ patch }: { patch: Patch }) {
	const { x, y, cell, cols, rows } = patch;
	return (
		<g>
			<rect
				x={x}
				y={y}
				width={cell * cols}
				height={cell * rows}
				fill={patch.base}
			/>
			{patch.cells.map((state, i) =>
				state === -1 ? null : (
					<rect
						// biome-ignore lint/suspicious/noArrayIndexKey: cells are static
						key={i}
						x={x + (i % cols) * cell}
						y={y + Math.floor(i / cols) * cell}
						width={cell}
						height={cell}
						fill={state ? patch.accent : patch.base}
					/>
				),
			)}
			{patch.clover && (
				<g fill={patch.clover.color}>
					<circle
						cx={patch.clover.cx - patch.clover.r}
						cy={patch.clover.cy}
						r={patch.clover.r}
					/>
					<circle
						cx={patch.clover.cx + patch.clover.r}
						cy={patch.clover.cy}
						r={patch.clover.r}
					/>
					<circle
						cx={patch.clover.cx}
						cy={patch.clover.cy - patch.clover.r}
						r={patch.clover.r}
					/>
					<circle
						cx={patch.clover.cx}
						cy={patch.clover.cy + patch.clover.r}
						r={patch.clover.r}
					/>
				</g>
			)}
		</g>
	);
}

function LabelShape({ label }: { label: Label }) {
	const stroke = "rgba(242, 236, 227, 0.55)";
	// Mono, 11px with 0.12em tracking ≈ 7.9px per character.
	const width = label.text.length * 7.9;
	const padX = 4;
	const rectX =
		label.anchor === "start"
			? label.x - padX
			: label.anchor === "end"
				? label.x - width - padX
				: label.x - width / 2 - padX;
	return (
		<g>
			{label.line && (
				<LeaderLine line={label.line} arrow={label.arrow} stroke={stroke} />
			)}
			{/* Dark plaque keeps labels readable over the colored patches */}
			<rect
				x={rectX}
				y={label.y - 11}
				width={width + padX * 2}
				height={15}
				rx={2}
				fill={PAPER_PALETTE.bg}
				opacity={0.82}
			/>
			<text
				x={label.x}
				y={label.y}
				textAnchor={label.anchor}
				letterSpacing="0.12em"
				opacity={0.92}
			>
				{label.text}
			</text>
		</g>
	);
}

function LeaderLine({
	line,
	arrow,
	stroke,
}: {
	line: NonNullable<Label["line"]>;
	arrow?: boolean;
	stroke: string;
}) {
	const { x1, y1, x2, y2 } = line;
	const angle = Math.atan2(y2 - y1, x2 - x1);
	const size = 7;
	const a1 = angle + Math.PI * 0.82;
	const a2 = angle - Math.PI * 0.82;

	return (
		<g stroke={stroke} strokeWidth={0.8} fill="none">
			<line x1={x1} y1={y1} x2={x2} y2={y2} />
			<circle cx={x1} cy={y1} r={1.6} fill={stroke} stroke="none" />
			{arrow && (
				<>
					<line
						x1={x2}
						y1={y2}
						x2={x2 + size * Math.cos(a1)}
						y2={y2 + size * Math.sin(a1)}
					/>
					<line
						x1={x2}
						y1={y2}
						x2={x2 + size * Math.cos(a2)}
						y2={y2 + size * Math.sin(a2)}
					/>
				</>
			)}
		</g>
	);
}

function Wordmark({ text }: { text: string }) {
	const fontSize = 32;
	const approxWidth = text.length * fontSize * 0.56;
	const logoGap = 22;
	const totalWidth = 18 + logoGap + approxWidth;
	const startX = POSTER.width / 2 - totalWidth / 2;

	return (
		<g transform={`translate(${startX} 92)`}>
			<g fill={PAPER_PALETTE.cream}>
				<circle cx={8} cy={0} r={6.4} />
				<circle cx={-8} cy={0} r={6.4} />
				<circle cx={0} cy={8} r={6.4} />
				<circle cx={0} cy={-8} r={6.4} />
			</g>
			<text
				x={18 + logoGap}
				y={fontSize / 3}
				fill={PAPER_PALETTE.cream}
				fontFamily={SANS}
				fontSize={fontSize}
				fontWeight={600}
				letterSpacing="-0.01em"
			>
				{text}
			</text>
		</g>
	);
}

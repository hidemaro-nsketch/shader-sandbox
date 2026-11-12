import { type Ref, useId } from "react";
import {
	type Annotation,
	type Bowtie,
	type Clover,
	type Cluster,
	type HandoffLayout,
	type Pipe,
	type Texture,
	type Thread,
	TOWER_PALETTE,
	TOWER_POSTER,
} from "../util/handoffTower";

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
const SANS =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

type HandoffTowerProps = {
	layout: HandoffLayout;
	wordmark: string;
	showLabels: boolean;
	showTextures: boolean;
	showGrain: boolean;
	seed: number;
	svgRef?: Ref<SVGSVGElement>;
};

/** Pattern tile sizes: dense weave, coarse graph paper, stipple and rules. */
const PATTERN_TILE: Record<Texture["kind"], number> = {
	grid: 9,
	hatch: 18,
	dots: 9,
	lines: 6,
};

const PATTERN_KEYS = ["green", "lime", "ink"] as const;
const PATTERN_COLORS: Record<(typeof PATTERN_KEYS)[number], string> = {
	green: TOWER_PALETTE.green,
	lime: TOWER_PALETTE.lime,
	ink: TOWER_PALETTE.ink,
};

export function HandoffTower({
	layout,
	wordmark,
	showLabels,
	showTextures,
	showGrain,
	seed,
	svgRef,
}: HandoffTowerProps) {
	const { width, height } = TOWER_POSTER;
	const uid = useId().replace(/:/g, "");
	const grainId = `tower-grain-${uid}`;
	const patternId = (kind: Texture["kind"], key: string) =>
		`tower-${kind}-${key}-${uid}`;
	const colorKey = (color: string) => {
		for (const key of PATTERN_KEYS) {
			if (PATTERN_COLORS[key] === color) return key;
		}
		return "green";
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
			<title id={`title-${uid}`}>Handoff tower poster</title>
			<defs>
				{PATTERN_KEYS.map((key) =>
					(["grid", "hatch", "dots", "lines"] as const).map((kind) => {
						const tile = PATTERN_TILE[kind];
						const color = PATTERN_COLORS[key];
						return (
							<pattern
								key={`${kind}-${key}`}
								id={patternId(kind, key)}
								width={tile}
								height={tile}
								patternUnits="userSpaceOnUse"
							>
								{kind === "dots" ? (
									<circle cx={tile / 2} cy={tile / 2} r={1.35} fill={color} />
								) : kind === "lines" ? (
									<line
										x1={0}
										y1={0.5}
										x2={tile}
										y2={0.5}
										stroke={color}
										strokeWidth={0.9}
									/>
								) : (
									<path
										d={`M0 0 H${tile} M0 0 V${tile}`}
										fill="none"
										stroke={color}
										strokeWidth={kind === "grid" ? 1.35 : 1.7}
									/>
								)}
							</pattern>
						);
					}),
				)}

				<filter id={grainId} x="0" y="0" width="100%" height="100%">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.85"
						numOctaves={3}
						seed={seed % 100}
						stitchTiles="stitch"
						result="noise"
					/>
					<feColorMatrix type="saturate" values="0" />
				</filter>
			</defs>

			<rect width={width} height={height} fill={TOWER_PALETTE.paper} />

			{/* Mosaic: every square is separated by a hairline paper seam. */}
			<g>
				{layout.cells.map((cell) => (
					<rect
						key={`${cell.x}-${cell.y}`}
						x={cell.x + 0.5}
						y={cell.y + 0.5}
						width={layout.cell - 1}
						height={layout.cell - 1}
						fill={cell.color}
					/>
				))}
			</g>

			{showTextures && (
				<g>
					{layout.textures.map((texture) => (
						<rect
							key={`${texture.x}-${texture.y}-${texture.kind}`}
							x={texture.x}
							y={texture.y}
							width={texture.w}
							height={texture.h}
							fill={`url(#${patternId(texture.kind, colorKey(texture.color))})`}
						/>
					))}
				</g>
			)}

			<g>
				{layout.clovers.map((clover) => (
					<CloverMark key={`${clover.x}-${clover.y}`} clover={clover} />
				))}
			</g>

			<Pipes pipes={layout.pipes} />

			<g>
				{layout.bowties.map((bowtie) => (
					<BowtieMark key={`${bowtie.x}-${bowtie.y}`} bowtie={bowtie} />
				))}
			</g>

			<g>
				{layout.caps.map((cap) => (
					<CloverMark key={`cap-${cap.x}`} clover={cap} narrow />
				))}
			</g>

			<g stroke={TOWER_PALETTE.ink} strokeWidth={0.8} fill="none">
				{layout.leaders.map((leader) => (
					<polyline
						key={leader.points.map((p) => `${p.x}-${p.y}`).join("_")}
						points={leader.points.map((p) => `${p.x},${p.y}`).join(" ")}
					/>
				))}
			</g>

			{showLabels && (
				<g>
					{layout.annotations.map((annotation) => (
						<AnnotationMark key={annotation.text} annotation={annotation} />
					))}
				</g>
			)}

			<g>
				{layout.clusters.map((cluster) => (
					<ClusterMark key={`${cluster.x}-${cluster.y}`} cluster={cluster} />
				))}
			</g>

			<g>
				{layout.threads.map((thread) => (
					<ThreadMark key={`${thread.x}-${thread.y1}`} thread={thread} />
				))}
			</g>

			<Wordmark text={wordmark} />
			<text
				x={width - 28}
				y={58}
				fontFamily={MONO}
				fontSize={10}
				letterSpacing="0.14em"
				fill={TOWER_PALETTE.ink}
				textAnchor="end"
			>
				NULL
			</text>

			{showGrain && (
				<rect
					width={width}
					height={height}
					filter={`url(#${grainId})`}
					opacity={0.12}
					style={{ mixBlendMode: "overlay" }}
					pointerEvents="none"
				/>
			)}
		</svg>
	);
}

/** Four lobes on the diagonals: the poster's signature mark. */
function CloverMark({
	clover,
	narrow = false,
}: {
	clover: Clover;
	narrow?: boolean;
}) {
	// Lobe circles are sized so the union spans exactly `size`, with a paper
	// notch between each pair (0.24 + 0.26 = 0.5 of the box).
	const lobe = clover.size * (narrow ? 0.26 : 0.275);
	const offset = clover.size * (narrow ? 0.24 : 0.225);
	return (
		<g fill={clover.color}>
			{[
				[-1, -1],
				[1, -1],
				[-1, 1],
				[1, 1],
			].map(([dx, dy]) => (
				<circle
					key={`${dx}-${dy}`}
					cx={clover.x + dx * offset}
					cy={clover.y + dy * offset}
					r={lobe}
				/>
			))}
			{/* Fills the pinched middle while keeping the four notches. */}
			<circle cx={clover.x} cy={clover.y} r={clover.size * 0.14} />
		</g>
	);
}

function Pipes({ pipes }: { pipes: readonly Pipe[] }) {
	const points = (pipe: Pipe) =>
		pipe.points.map((p) => `${p.x},${p.y}`).join(" ");
	return (
		<g fill="none" strokeLinecap="round" strokeLinejoin="round">
			{/* Outer rail */}
			<g stroke={TOWER_PALETTE.blue}>
				{pipes.map((pipe) => (
					<polyline
						key={`rail-${points(pipe)}`}
						points={points(pipe)}
						strokeWidth={pipe.width}
					/>
				))}
			</g>
			{/* Paper channel between the rails */}
			<g stroke={TOWER_PALETTE.chip}>
				{pipes.map((pipe) => (
					<polyline
						key={`channel-${points(pipe)}`}
						points={points(pipe)}
						strokeWidth={pipe.width * 0.3}
					/>
				))}
			</g>
			{/* Dashed centre line */}
			<g stroke="#ffffff" strokeWidth={2.6} strokeDasharray="0.1 24">
				{pipes.map((pipe) => (
					<polyline key={`dot-${points(pipe)}`} points={points(pipe)} />
				))}
			</g>
		</g>
	);
}

function BowtieMark({ bowtie }: { bowtie: Bowtie }) {
	const ry = bowtie.height / 2;
	const rx = Math.max(ry, (bowtie.width - bowtie.height) / 2);
	const offset = bowtie.height * 0.5;
	return (
		<g fill={bowtie.color}>
			<ellipse cx={bowtie.x - offset} cy={bowtie.y} rx={rx} ry={ry} />
			<ellipse cx={bowtie.x + offset} cy={bowtie.y} rx={rx} ry={ry} />
		</g>
	);
}

function AnnotationMark({ annotation }: { annotation: Annotation }) {
	const fontSize = 12.5;
	// Mono at 12.5px with 0.06em tracking is about 7.8px per character.
	const textWidth = annotation.text.length * 7.8;
	const padX = 5;
	const width = textWidth + padX * 2;
	const left =
		annotation.anchor === "start"
			? annotation.x - padX
			: annotation.anchor === "end"
				? annotation.x - textWidth - padX
				: annotation.x - width / 2;

	return (
		<g>
			{annotation.leader && (
				<g fill="none" stroke={TOWER_PALETTE.ink} strokeWidth={0.8}>
					<polyline
						points={annotation.leader.points
							.map((p) => `${p.x},${p.y}`)
							.join(" ")}
					/>
					<circle
						cx={annotation.leader.points[0].x}
						cy={annotation.leader.points[0].y}
						r={1.7}
						fill={TOWER_PALETTE.ink}
					/>
				</g>
			)}
			<rect
				x={left}
				y={annotation.y - 13}
				width={width}
				height={17}
				fill={TOWER_PALETTE.chip}
			/>
			<text
				x={annotation.x}
				y={annotation.y}
				fontFamily={MONO}
				fontSize={fontSize}
				letterSpacing="0.06em"
				fill={TOWER_PALETTE.ink}
				textAnchor={annotation.anchor}
			>
				{annotation.text}
			</text>
		</g>
	);
}

function ClusterMark({ cluster }: { cluster: Cluster }) {
	const gap = 7.5;
	const dots: { x: number; y: number }[] = [];
	for (let row = 0; row < cluster.rows; row++) {
		for (let col = 0; col < cluster.cols; col++) {
			dots.push({
				x: cluster.x + (col - (cluster.cols - 1) / 2) * gap,
				y: cluster.y + (row - (cluster.rows - 1) / 2) * gap,
			});
		}
	}
	return (
		<g fill={cluster.color}>
			{dots.map((dot) => (
				<circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r={3.1} />
			))}
		</g>
	);
}

function ThreadMark({ thread }: { thread: Thread }) {
	return (
		<g>
			<line
				x1={thread.x}
				y1={thread.y1}
				x2={thread.x}
				y2={thread.y2}
				stroke={TOWER_PALETTE.ink}
				strokeWidth={1}
				strokeDasharray={thread.dashed ? "1 7" : undefined}
			/>
			{thread.dots.map((dot) => (
				<circle key={dot.y} cx={thread.x} cy={dot.y} r={2.2} fill={dot.color} />
			))}
		</g>
	);
}

function Wordmark({ text }: { text: string }) {
	const fontSize = 38;
	const textWidth = Math.max(60, text.length * fontSize * 0.56);
	const logoWidth = 30;
	const gap = 16;
	const total = logoWidth + gap + textWidth;
	const startX = TOWER_POSTER.width / 2 - total / 2;
	const centerY = 100;

	return (
		<g>
			<g
				fill={TOWER_PALETTE.ink}
				transform={`translate(${startX + 14} ${centerY})`}
			>
				<circle cx={0} cy={-7.5} r={6.2} />
				<circle cx={0} cy={7.5} r={6.2} />
				<circle cx={-7.5} cy={0} r={6.2} />
				<circle cx={7.5} cy={0} r={6.2} />
			</g>
			<text
				x={startX + logoWidth + gap}
				y={centerY + fontSize / 3}
				fill={TOWER_PALETTE.ink}
				fontFamily={SANS}
				fontSize={fontSize}
				fontWeight={700}
				letterSpacing="-0.02em"
			>
				{text}
			</text>
		</g>
	);
}

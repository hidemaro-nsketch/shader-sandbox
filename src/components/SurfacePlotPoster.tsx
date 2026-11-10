import { type Ref, useId, useMemo } from "react";
import {
	buildSurfaceGrid,
	makeFit,
	makeProjector,
	PLOTS_PALETTE,
	PLOTS_POSTER,
	type Point2,
	SURFACE_METRICS,
	type SurfaceMetric,
} from "../util/surfacePlots";

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
const SANS =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

type SurfacePlotPosterProps = {
	seed: number;
	/** Number of time steps in the wireframe. Country rows scale from it. */
	density: number;
	showFill: boolean;
	svgRef?: Ref<SVGSVGElement>;
};

const COLS = 4;
const MARGIN = 58;
const COL_PITCH = 370;
const PLOT_W = 310;
const PLOT_H = 235;
const ROW_PLOT_Y = [86, 470];
const ROW_TITLE_Y = [352, 736];

export function SurfacePlotPoster({
	seed,
	density,
	showFill,
	svgRef,
}: SurfacePlotPosterProps) {
	const uid = useId().replace(/:/g, "");
	const { width, height } = PLOTS_POSTER;

	return (
		<svg
			ref={svgRef}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
			className="h-full w-full"
			role="img"
			aria-labelledby={`title-${uid}`}
		>
			<title id={`title-${uid}`}>Wireframe surface plots</title>

			<defs>
				<filter id={`grain-${uid}`} x="0" y="0" width="100%" height="100%">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.8"
						numOctaves={3}
						stitchTiles="stitch"
					/>
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<radialGradient id={`vignette-${uid}`} cx="50%" cy="45%" r="75%">
					<stop offset="55%" stopColor="#000" stopOpacity="0" />
					<stop offset="100%" stopColor="#000" stopOpacity="0.5" />
				</radialGradient>
			</defs>

			<rect width={width} height={height} fill={PLOTS_PALETTE.bg} />

			{/* Top hairline */}
			<line
				x1={MARGIN}
				y1={52}
				x2={width - MARGIN}
				y2={52}
				stroke="#3b3b37"
				strokeWidth={1}
			/>

			{SURFACE_METRICS.map((metric, index) => {
				const col = index % COLS;
				const row = Math.floor(index / COLS);
				const rect = {
					x: MARGIN + col * COL_PITCH,
					y: ROW_PLOT_Y[row],
					w: PLOT_W,
					h: PLOT_H,
				};
				return (
					<SurfacePlot
						key={metric.id}
						metric={metric}
						seed={seed + index * 7919}
						density={density}
						showFill={showFill}
						rect={rect}
						titleY={ROW_TITLE_Y[row]}
						textX={MARGIN + col * COL_PITCH + 2}
					/>
				);
			})}

			<text
				x={MARGIN}
				y={height - 26}
				fill={PLOTS_PALETTE.muted}
				fontFamily={MONO}
				fontSize={11}
				letterSpacing="0.02em"
			>
				Terrain: years × countries × value. Values in this study are synthetic.
			</text>

			<rect
				width={width}
				height={height}
				fill={`url(#vignette-${uid})`}
				pointerEvents="none"
			/>
			<rect
				width={width}
				height={height}
				filter={`url(#grain-${uid})`}
				opacity={0.05}
				style={{ mixBlendMode: "overlay" }}
				pointerEvents="none"
			/>
		</svg>
	);
}

function SurfacePlot({
	metric,
	seed,
	density,
	showFill,
	rect,
	titleY,
	textX,
}: {
	metric: SurfaceMetric;
	seed: number;
	density: number;
	showFill: boolean;
	rect: { x: number; y: number; w: number; h: number };
	titleY: number;
	textX: number;
}) {
	const nx = Math.max(8, Math.round(density));
	const ny = Math.max(6, Math.round(density * 0.62));

	const { project, values } = useMemo(() => {
		const grid = buildSurfaceGrid(metric, seed, nx, ny);
		const projector = makeProjector();
		const projected = grid.values.map((row, i) =>
			row.map((v, j) => projector(i / nx, j / ny, v)),
		);
		const fitPoints: Point2[] = [
			...projected.flat(),
			projector(0, 0, 1.18),
			projector(1, 0, 0),
			projector(0, 0, 0),
		];
		const toCell = makeFit(fitPoints, rect);
		return {
			values: grid.values,
			project: (i: number, j: number, z: number) =>
				toCell(projector(i / nx, j / ny, z)),
		};
	}, [metric, seed, nx, ny, rect]);

	const p = (i: number, j: number, z: number): Point2 => project(i, j, z);
	const path = (points: Point2[]) =>
		points
			.map(
				(pt, k) =>
					`${k === 0 ? "M" : "L"}${pt[0].toFixed(2)},${pt[1].toFixed(2)}`,
			)
			.join(" ");

	// Ground plane + value axis
	const floor = [
		p(0, 0, 0),
		p(nx, 0, 0),
		p(nx, ny, 0),
		p(0, ny, 0),
		p(0, 0, 0),
	];
	const axisTop = p(0, 0, 1.18);

	// Mint wall on the far edge (last year) from the surface down to the floor
	const wall: Point2[] = [];
	wall.push(p(nx, 0, 0));
	for (let j = 0; j <= ny; j++) wall.push(p(nx, j, 0));
	for (let j = ny; j >= 0; j--) wall.push(p(nx, j, values[nx][j]));

	// Wireframe
	const rows: Point2[][] = [];
	for (let j = 0; j <= ny; j++) {
		const line: Point2[] = [];
		for (let i = 0; i <= nx; i++) line.push(p(i, j, values[i][j]));
		rows.push(line);
	}
	const cols: Point2[][] = [];
	for (let i = 0; i <= nx; i++) {
		const line: Point2[] = [];
		for (let j = 0; j <= ny; j++) line.push(p(i, j, values[i][j]));
		cols.push(line);
	}

	const corner = p(nx, 0, 0);

	return (
		<g>
			<path
				d={path(floor)}
				fill="none"
				stroke={PLOTS_PALETTE.ground}
				strokeWidth={0.7}
			/>
			<line
				x1={p(0, 0, 0)[0]}
				y1={p(0, 0, 0)[1]}
				x2={axisTop[0]}
				y2={axisTop[1]}
				stroke={PLOTS_PALETTE.ground}
				strokeWidth={0.8}
			/>
			{/* tick at the top of the value axis */}
			<line
				x1={axisTop[0] - 4}
				y1={axisTop[1]}
				x2={axisTop[0] + 4}
				y2={axisTop[1]}
				stroke={PLOTS_PALETTE.ground}
				strokeWidth={0.8}
			/>

			{showFill && (
				<path d={`${path(wall)} Z`} fill={PLOTS_PALETTE.fill} stroke="none" />
			)}

			<g
				fill="none"
				stroke={PLOTS_PALETTE.wire}
				strokeWidth={0.55}
				opacity={0.92}
			>
				{rows.map((line) => (
					<path
						key={`r-${line[0][0].toFixed(1)}-${line[0][1].toFixed(1)}`}
						d={path(line)}
					/>
				))}
				{cols.map((line) => (
					<path
						key={`c-${line[0][0].toFixed(1)}-${line[0][1].toFixed(1)}`}
						d={path(line)}
					/>
				))}
			</g>

			{/* Value axis label */}
			<text
				x={axisTop[0] - 12}
				y={axisTop[1] + 2}
				fill={PLOTS_PALETTE.muted}
				fontFamily={MONO}
				fontSize={10}
				textAnchor="end"
			>
				{metric.axis}
			</text>

			{/* Range tick + label under the front-right corner */}
			<line
				x1={corner[0]}
				y1={corner[1]}
				x2={corner[0]}
				y2={corner[1] + 9}
				stroke={PLOTS_PALETTE.ground}
				strokeWidth={0.8}
			/>
			<text
				x={corner[0]}
				y={corner[1] + 27}
				fill={PLOTS_PALETTE.muted}
				fontFamily={MONO}
				fontSize={11}
				letterSpacing="0.04em"
				textAnchor="middle"
			>
				{metric.years}
			</text>

			{/* Copy block */}
			<g>
				{metric.title.map((line, i) => (
					<text
						// biome-ignore lint/suspicious/noArrayIndexKey: static copy
						key={i}
						x={textX}
						y={titleY + i * 23}
						fill={PLOTS_PALETTE.text}
						fontFamily={SANS}
						fontSize={17}
					>
						{line}
					</text>
				))}
				{metric.subtitle.map((line, i) => (
					<text
						// biome-ignore lint/suspicious/noArrayIndexKey: static copy
						key={i}
						x={textX}
						y={titleY + metric.title.length * 23 + 8 + i * 15}
						fill={PLOTS_PALETTE.muted}
						fontFamily={MONO}
						fontSize={10}
					>
						{line}
					</text>
				))}
				<text
					x={textX}
					y={
						titleY +
						metric.title.length * 23 +
						8 +
						metric.subtitle.length * 15 +
						9
					}
					fill={PLOTS_PALETTE.dim}
					fontFamily={MONO}
					fontSize={9.5}
				>
					{metric.source}
				</text>
			</g>
		</g>
	);
}

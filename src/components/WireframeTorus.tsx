import { type Ref, useId, useMemo } from "react";
import {
	axialRing,
	CAD_PALETTE,
	CAD_POSTER,
	cylinderPolylines,
	floorGrid,
	makeCamera,
	makeFit,
	makeProjector,
	type Point2,
	TORUS,
	torusPolylines,
	type Vec3,
	type Wire,
} from "../util/wireframeTorus";

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';

export type WireframeParams = {
	azimuth: number;
	elevation: number;
	/** Meridians around the tube axis. */
	segments: number;
	/** Rings around the tube section. */
	sides: number;
	showGrid: boolean;
	showDimensions: boolean;
};

type WireframeTorusProps = WireframeParams & {
	svgRef?: Ref<SVGSVGElement>;
};

const FLOOR_Y = -(TORUS.majorRadius + TORUS.minorRadius);
const FOOT_X_MIN = -TORUS.minorRadius;
const FOOT_X_MAX = TORUS.depth - TORUS.minorRadius;
const Z_HALF = TORUS.majorRadius + TORUS.minorRadius;
/** Boss inside the drum that carries the highlighted part. */
const BOSS_RADIUS = 86;
const BOSS_X = 210;

export function WireframeTorus({
	azimuth,
	elevation,
	segments,
	sides,
	showGrid,
	showDimensions,
	svgRef,
}: WireframeTorusProps) {
	const uid = useId().replace(/:/g, "");

	const scene = useMemo(() => {
		const project3 = makeProjector(makeCamera(azimuth, elevation));

		// --- Housing ------------------------------------------------------
		const wires: { line: Wire; weight: number }[] = [];

		// Rim: outer tube surface.
		for (const line of torusPolylines(TORUS.minorRadius, segments, sides)) {
			wires.push({ line, weight: 0.85 });
		}

		// Drum (hole wall) and its rim rings.
		for (const line of cylinderPolylines(
			TORUS.holeRadius,
			-TORUS.minorRadius,
			FOOT_X_MAX,
			26,
		)) {
			wires.push({ line, weight: 0.6 });
		}
		for (const x of [-TORUS.minorRadius, FOOT_X_MAX]) {
			wires.push({ line: axialRing(TORUS.holeRadius, x, 96), weight: 0.85 });
		}

		// Boss inside the hole.
		for (const line of cylinderPolylines(BOSS_RADIUS, 120, BOSS_X, 16)) {
			wires.push({ line, weight: 0.7 });
		}
		wires.push({ line: axialRing(BOSS_RADIUS, BOSS_X, 72), weight: 0.8 });

		// Highlighted part on the boss.
		const accent: Wire[] = [];
		for (const line of torusPolylines(13, 20, 8, BOSS_RADIUS - 26)) {
			accent.push(line.map(([x, y, z]) => [x + BOSS_X - 6, y, z] as Vec3));
		}
		accent.push(axialRing(BOSS_RADIUS - 20, BOSS_X + 2, 60));
		accent.push(axialRing(BOSS_RADIUS - 34, BOSS_X + 2, 60));

		// --- Floor ---------------------------------------------------------
		const grid: Wire[] = showGrid ? floorGrid(540, 40, FLOOR_Y) : [];

		const foot: Wire = [
			[FOOT_X_MIN, FLOOR_Y, -Z_HALF],
			[FOOT_X_MAX, FLOOR_Y, -Z_HALF],
			[FOOT_X_MAX, FLOOR_Y, Z_HALF],
			[FOOT_X_MIN, FLOOR_Y, Z_HALF],
			[FOOT_X_MIN, FLOOR_Y, -Z_HALF],
		];

		// Vertical guides from the rim down to the footprint.
		const guides: Wire[] = [FOOT_X_MIN, FOOT_X_MAX].map((x) => [
			[x, FLOOR_Y, 0],
			[x, 0, 0],
		]);

		// --- Dimensions ------------------------------------------------------
		const off = 110;
		const depthLine: Wire = [
			[FOOT_X_MIN, FLOOR_Y, Z_HALF + off],
			[FOOT_X_MAX, FLOOR_Y, Z_HALF + off],
		];
		const depthExt: Wire[] = [FOOT_X_MIN, FOOT_X_MAX].map((x) => [
			[x, FLOOR_Y, Z_HALF],
			[x, FLOOR_Y, Z_HALF + off + 50],
		]);
		const widthLine: Wire = [
			[FOOT_X_MAX + off, FLOOR_Y, -Z_HALF],
			[FOOT_X_MAX + off, FLOOR_Y, Z_HALF],
		];
		const widthExt: Wire[] = [-Z_HALF, Z_HALF].map((z) => [
			[FOOT_X_MAX, FLOOR_Y, z],
			[FOOT_X_MAX + off + 50, FLOOR_Y, z],
		]);

		// --- Project & fit ---------------------------------------------------
		const all: Vec3[] = [
			...wires.flatMap((w) => w.line),
			...accent.flat(),
			...foot,
			...guides.flat(),
			...depthLine,
			...depthExt.flat(),
			...widthLine,
			...widthExt.flat(),
		];
		const { width: W, height: H } = CAD_POSTER;
		const toFrame = makeFit(
			all.map(project3),
			{ x: 40, y: 30, w: W - 80, h: H - 60 },
			false,
		);
		const project = (p: Vec3): Point2 => toFrame(project3(p));

		const depthMid = project([
			(FOOT_X_MIN + FOOT_X_MAX) / 2,
			FLOOR_Y,
			Z_HALF + off,
		]);
		const widthMid = project([FOOT_X_MAX + off, FLOOR_Y, 0]);

		return {
			wires: wires.map((w) => ({
				weight: w.weight,
				points: w.line.map(project),
			})),
			accent: accent.map((line) => line.map(project)),
			grid: grid.map((line) => line.map(project)),
			foot: foot.map(project),
			guides: guides.map((line) => line.map(project)),
			depthLine: depthLine.map(project),
			depthExt: depthExt.map((line) => line.map(project)),
			widthLine: widthLine.map(project),
			widthExt: widthExt.map((line) => line.map(project)),
			depthMid,
			widthMid,
		};
	}, [azimuth, elevation, segments, sides, showGrid]);

	const path = (points: Point2[]) =>
		points
			.map(
				([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`,
			)
			.join(" ");

	const keyOf = (line: Point2[]) =>
		`${line[0][0].toFixed(1)}-${line[0][1].toFixed(1)}`;

	return (
		<svg
			ref={svgRef}
			viewBox={`0 0 ${CAD_POSTER.width} ${CAD_POSTER.height}`}
			xmlns="http://www.w3.org/2000/svg"
			className="h-full w-full"
			role="img"
			aria-labelledby={`title-${uid}`}
		>
			<title id={`title-${uid}`}>Wireframe torus engineering drawing</title>

			<defs>
				<filter
					id={`glow-${uid}`}
					x="-120%"
					y="-120%"
					width="340%"
					height="340%"
				>
					<feGaussianBlur stdDeviation="2.6" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
				<radialGradient id={`vignette-${uid}`} cx="50%" cy="45%" r="72%">
					<stop offset="50%" stopColor="#000" stopOpacity="0" />
					<stop offset="100%" stopColor="#000" stopOpacity="0.6" />
				</radialGradient>
				<clipPath id={`frame-${uid}`}>
					<rect width={CAD_POSTER.width} height={CAD_POSTER.height} />
				</clipPath>
			</defs>

			<rect
				width={CAD_POSTER.width}
				height={CAD_POSTER.height}
				fill={CAD_PALETTE.bg}
			/>

			<g clipPath={`url(#frame-${uid})`}>
				{showGrid && (
					<g
						fill="none"
						stroke={CAD_PALETTE.grid}
						strokeWidth={0.5}
						opacity={0.26}
					>
						{scene.grid.map((line) => (
							<path key={`g${keyOf(line)}`} d={path(line)} />
						))}
					</g>
				)}

				<g
					fill="none"
					stroke={CAD_PALETTE.wire}
					strokeWidth={0.7}
					opacity={0.9}
				>
					<path d={path(scene.foot)} />
					{scene.guides.map((line) => (
						<path key={`v${keyOf(line)}`} d={path(line)} />
					))}
				</g>

				{showDimensions && (
					<>
						<g fill="none" stroke={CAD_PALETTE.wire} strokeWidth={0.55}>
							{scene.depthExt.map((line) => (
								<path key={`de${keyOf(line)}`} d={path(line)} />
							))}
							{scene.widthExt.map((line) => (
								<path key={`we${keyOf(line)}`} d={path(line)} />
							))}
							<path d={path(scene.depthLine)} />
							<path d={path(scene.widthLine)} />
						</g>
						<Arrow from={scene.depthLine[0]} to={scene.depthLine[1]} />
						<Arrow from={scene.widthLine[0]} to={scene.widthLine[1]} />
						<text
							x={scene.depthMid[0]}
							y={scene.depthMid[1] + 24}
							fill={CAD_PALETTE.wire}
							fontFamily={MONO}
							fontSize={15}
							textAnchor="middle"
						>
							405 mm
						</text>
						<text
							x={scene.widthMid[0] + 30}
							y={scene.widthMid[1] + 4}
							fill={CAD_PALETTE.wire}
							fontFamily={MONO}
							fontSize={15}
						>
							720 mm
						</text>
					</>
				)}

				<g fill="none" stroke={CAD_PALETTE.wire} strokeLinecap="round">
					{scene.wires.map((w) => (
						<path
							key={`w${keyOf(w.points)}`}
							d={path(w.points)}
							strokeWidth={w.weight}
							opacity={0.88}
						/>
					))}
				</g>

				<g
					fill="none"
					stroke={CAD_PALETTE.accent}
					strokeWidth={1.3}
					filter={`url(#glow-${uid})`}
				>
					{scene.accent.map((line) => (
						<path key={`a${keyOf(line)}`} d={path(line)} />
					))}
				</g>

				<rect
					width={CAD_POSTER.width}
					height={CAD_POSTER.height}
					fill={`url(#vignette-${uid})`}
					pointerEvents="none"
				/>
			</g>
		</svg>
	);
}

function Arrow({ from, to }: { from: Point2; to: Point2 }) {
	const [x1, y1] = from;
	const [x2, y2] = to;
	const angle = Math.atan2(y2 - y1, x2 - x1);
	const size = 14;
	const wing = (a: number): Point2 => [
		x1 + size * Math.cos(angle + a),
		y1 + size * Math.sin(angle + a),
	];
	const wing2 = (a: number): Point2 => [
		x2 - size * Math.cos(angle + a),
		y2 - size * Math.sin(angle + a),
	];
	const a1 = wing(0.42);
	const a2 = wing(-0.42);
	const b1 = wing2(0.42);
	const b2 = wing2(-0.42);
	return (
		<g stroke={CAD_PALETTE.wire} strokeWidth={0.8} fill="none">
			<path d={`M${a1[0]},${a1[1]} L${x1},${y1} L${a2[0]},${a2[1]}`} />
			<path d={`M${b1[0]},${b1[1]} L${x2},${y2} L${b2[0]},${b2[1]}`} />
		</g>
	);
}

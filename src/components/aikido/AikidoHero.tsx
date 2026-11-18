import { type Ref, useMemo } from "react";
import {
	AIKIDO_POSTER,
	AK,
	type Cloud,
	chevron,
	cloudShape,
	createRng,
	markPath,
	type Rng,
	range,
	round,
} from "../../util/aikido";

/**
 * Panel 1 — marketing hero: outlined skyline of "cities and clouds" with a
 * mountain of violet data bars, plus a product card sliding in from the right.
 */

const SEED = 0x4a1d;

/** Layers in paint order: background, skyline, bars, clouds, card body, tabs, panel, stepper + header. */
export const STAGE_COUNT = 8;

/** Skyline silhouette: back row of outlined towers. */
function buildSkyline(rng: Rng) {
	const towers: {
		x: number;
		y: number;
		w: number;
		h: number;
		shelf?: number;
	}[] = [];
	let x = -10;
	while (x < AIKIDO_POSTER.width + 20) {
		const w = range(rng, 8, 38);
		const h = range(rng, 70, 330);
		towers.push({
			x: round(x),
			y: round(960 - h),
			w: round(w),
			h: round(h),
			shelf: rng() > 0.6 ? round(960 - h * range(rng, 0.3, 0.6)) : undefined,
		});
		x += w + range(rng, 10, 34);
	}
	return towers;
}

/** Violet bars: a jagged mountain profile across the full width. */
function buildBars(rng: Rng) {
	const profile: [number, number][] = [
		[0, 150],
		[0.06, 300],
		[0.12, 345],
		[0.18, 300],
		[0.24, 330],
		[0.31, 345],
		[0.38, 365],
		[0.45, 390],
		[0.51, 345],
		[0.57, 285],
		[0.63, 235],
		[0.69, 270],
		[0.75, 320],
		[0.81, 360],
		[0.87, 390],
		[0.93, 375],
		[1, 360],
	];
	const height = (t: number) => {
		for (let i = 1; i < profile.length; i++) {
			const [x1, h1] = profile[i];
			if (t <= x1) {
				const [x0, h0] = profile[i - 1];
				const k = (t - x0) / (x1 - x0);
				return h0 + (h1 - h0) * k;
			}
		}
		return profile[profile.length - 1][1];
	};

	const bars: { x: number; y: number; w: number; h: number; tone: number }[] =
		[];
	const pitch = 13.5;
	for (let i = 0; i * pitch + 14 < AIKIDO_POSTER.width - 8; i++) {
		const x = 16 + i * pitch + range(rng, 0, 2.4);
		const t = x / AIKIDO_POSTER.width;
		const h = height(t) + range(rng, -18, 18);
		bars.push({
			x: round(x),
			y: round(960 - h),
			w: round(range(rng, 7.5, 12.5)),
			h: round(h),
			tone: rng(),
		});
	}
	return bars;
}

/** A few violet-outlined towers that poke out above the data bars. */
function buildOutlines(rng: Rng) {
	const boxes: { x: number; y: number; w: number; h: number }[] = [];
	for (let i = 0; i < 16; i++) {
		const x = range(rng, 40, 1560);
		const w = range(rng, 18, 54);
		const h = range(rng, 50, 170);
		const base = range(rng, 470, 760);
		boxes.push({
			x: round(x),
			y: round(base - h),
			w: round(w),
			h: round(h),
		});
	}
	return boxes;
}

const CLOUDS: {
	x: number;
	y: number;
	w: number;
	h: number;
	lumps: number;
	tick: number;
}[] = [
	{ x: -60, y: 505, w: 380, h: 150, lumps: 3, tick: 46 },
	{ x: 560, y: 430, w: 420, h: 120, lumps: 4, tick: 42 },
	{ x: 1140, y: 350, w: 540, h: 140, lumps: 5, tick: 46 },
	{ x: 830, y: 470, w: 130, h: 62, lumps: 2, tick: 30 },
	{ x: 455, y: 690, w: 260, h: 72, lumps: 3, tick: 30 },
	{ x: 640, y: 655, w: 190, h: 66, lumps: 2, tick: 28 },
	{ x: 1030, y: 560, w: 190, h: 66, lumps: 2, tick: 28 },
];

function AikidoMark({ x, y, h }: { x: number; y: number; h: number }) {
	const w = h / (40 / 47);
	return (
		<g transform={`translate(${x} ${y})`}>
			<path d={markPath(w)} fill={AK.ink} />
		</g>
	);
}

function Card({ stage }: { stage: number }) {
	const tabs = [
		{ label: "Overview", x: 716, active: true },
		{ label: "Issues", x: 830, count: "3", pill: 876 },
		{ label: "Endpoints", x: 945, count: "0", pill: 1017 },
		{ label: "Agents", x: 1082, count: "128", pill: 1129 },
		{ label: "Request Logs", x: 1192, count: "0", pill: 1288 },
	] satisfies {
		label: string;
		x: number;
		active?: boolean;
		count?: string;
		pill?: number;
	}[];

	return (
		<g>
			{stage >= 5 && (
				<>
					{/* shadow + body */}
					<rect
						x={702}
						y={560}
						width={906}
						height={420}
						rx={10}
						fill={AK.ink}
						opacity={0.12}
					/>
					<rect
						x={696}
						y={550}
						width={912}
						height={430}
						rx={10}
						fill={AK.white}
						stroke={AK.ink}
						strokeWidth={2.5}
					/>
				</>
			)}

			{stage >= 6 && (
				<>
					{/* breadcrumb */}
					<rect
						x={716}
						y={572}
						width={104}
						height={27}
						rx={13.5}
						fill="none"
						stroke={AK.hairline}
						strokeWidth={1.4}
					/>
					<path
						d={chevron(806, 585, 9, "d")}
						fill="none"
						stroke={AK.inkSoft}
						strokeWidth={1.4}
					/>
					<g>
						<path
							d="M838 582l4 4-4 4"
							fill="none"
							stroke="#b0ada9"
							strokeWidth={1.6}
						/>
						<path
							d="M910 582l4 4-4 4"
							fill="none"
							stroke="#b0ada9"
							strokeWidth={1.6}
						/>
						<path
							d="M988 582l4 4-4 4"
							fill="none"
							stroke="#b0ada9"
							strokeWidth={1.6}
						/>
					</g>

					{/* title + tabs */}
					<line
						x1={696}
						y1={672}
						x2={1608}
						y2={672}
						stroke={AK.paperDeep}
						strokeWidth={1.5}
					/>
					{tabs.map((tab) => (
						<g key={tab.label}>
							{tab.count && tab.pill !== undefined && (
								<rect
									x={tab.pill}
									y={690}
									width={tab.count.length > 1 ? 24 : 19}
									height={17}
									rx={8.5}
									fill="none"
									stroke={AK.hairline}
									strokeWidth={1.2}
								/>
							)}
							{tab.active && (
								<line
									x1={tab.x}
									y1={710}
									x2={tab.x + 74}
									y2={710}
									stroke={AK.ink}
									strokeWidth={2}
								/>
							)}
						</g>
					))}
				</>
			)}

			{stage >= 7 && (
				<>
					{/* running panel */}
					<rect x={696} y={720} width={912} height={260} fill={AK.paper} />
					<rect
						x={716}
						y={740}
						width={872}
						height={90}
						rx={8}
						fill={AK.white}
						stroke="#dcd9d5"
						strokeWidth={1.2}
					/>
					<rect
						x={734}
						y={758}
						width={54}
						height={54}
						rx={10}
						fill={AK.paper}
						stroke="#dcd9d5"
						strokeWidth={1.2}
					/>
					<circle
						cx={761}
						cy={785}
						r={9}
						fill="none"
						stroke={AK.inkSoft}
						strokeWidth={1.6}
						strokeDasharray="14 40"
					/>
				</>
			)}

			{stage >= 8 && (
				<>
					{/* stepper */}
					<line
						x1={760}
						y1={886}
						x2={1560}
						y2={886}
						stroke="#c9c6c2"
						strokeWidth={2}
					/>
					{[760, 1160, 1512].map((x, i) => (
						<g key={x}>
							<circle
								cx={x}
								cy={886}
								r={9}
								fill={i === 2 ? AK.white : "#8b8884"}
								stroke={i === 2 ? "#8b8884" : "none"}
								strokeWidth={2}
							/>
							<path
								d={`M${x - 4} 886l3 3 5-6`}
								fill="none"
								stroke={AK.white}
								strokeWidth={1.8}
							/>
						</g>
					))}
				</>
			)}
		</g>
	);
}

export function AikidoHero({
	svgRef,
	stage = STAGE_COUNT,
}: {
	svgRef?: Ref<SVGSVGElement>;
	/** Draw only the first `stage` layers (1..STAGE_COUNT); default is the full piece. */
	stage?: number;
}) {
	// All random layers come from one fresh rng, consumed in a fixed order, so
	// the output never depends on how many times React re-runs the memo.
	const { towers, bars, outlines, clouds } = useMemo(() => {
		const rng = createRng(SEED);
		return {
			towers: buildSkyline(rng),
			bars: buildBars(rng),
			outlines: buildOutlines(rng),
			clouds: CLOUDS.map((spec): Cloud => cloudShape(rng, spec)),
		};
	}, []);

	return (
		<svg
			ref={svgRef}
			viewBox={`0 0 ${AIKIDO_POSTER.width} ${AIKIDO_POSTER.height}`}
			width="100%"
			height="100%"
			role="img"
			aria-label="Aikido marketing hero with a skyline of data bars"
		>
			<rect width={1600} height={960} fill={AK.paper} />

			{stage >= 2 && (
				<>
					{/* skyline */}
					<g stroke={AK.hairline} strokeWidth={1.6} fill="none">
						{towers.map((t) => (
							<g key={`${t.x}-${t.y}`}>
								<rect x={t.x} y={t.y} width={t.w} height={t.h} />
								{t.shelf !== undefined && (
									<line x1={t.x} y1={t.shelf} x2={t.x + t.w} y2={t.shelf} />
								)}
							</g>
						))}
					</g>
				</>
			)}

			{stage >= 3 && (
				<>
					{/* violet data bars */}
					<g>
						{outlines.map((b) => (
							<rect
								key={`${b.x}-${b.y}`}
								x={b.x}
								y={b.y}
								width={b.w}
								height={b.h}
								fill={AK.paper}
								stroke={AK.violet}
								strokeWidth={1.6}
							/>
						))}
						{bars.map((b) => (
							<rect
								key={b.x}
								x={b.x}
								y={b.y}
								width={b.w}
								height={b.h}
								fill={b.tone > 0.82 ? AK.violetDeep : AK.violet}
								opacity={b.tone < 0.12 ? 0.55 : 1}
							/>
						))}
					</g>
				</>
			)}

			{stage >= 4 && (
				<>
					{/* clouds drawn on top of the data */}
					{clouds.map((c) => (
						<g key={c.d.slice(0, 24)}>
							<path d={c.d} fill={AK.paper} stroke={AK.ink} strokeWidth={2.2} />
							<g stroke={AK.ink} strokeWidth={1.5}>
								{c.ticks.map((t) => (
									<line
										key={`${t.x1}-${t.y2}`}
										x1={t.x1}
										y1={t.y1}
										x2={t.x2}
										y2={t.y2}
									/>
								))}
							</g>
						</g>
					))}
				</>
			)}

			{stage >= 8 && (
				<>
					{/* header */}
					<g>
						<AikidoMark x={58} y={42} h={34} />
						<rect x={1364} y={42} width={162} height={40} fill={AK.ink} />
						<path
							d={`M1496 62h10m-4-4 4 4-4 4`}
							fill="none"
							stroke={AK.white}
							strokeWidth={1.8}
						/>

						{/* headline */}
						<rect
							x={1093}
							y={264}
							width={132}
							height={34}
							fill="none"
							stroke={AK.ink}
							strokeWidth={1.6}
						/>
						<path
							d="M1201 281h9m-3.6-3.6 3.6 3.6-3.6 3.6"
							fill="none"
							stroke={AK.ink}
							strokeWidth={1.6}
						/>
					</g>
				</>
			)}

			<g transform="translate(0 18)">
				<Card stage={stage} />
			</g>
		</svg>
	);
}

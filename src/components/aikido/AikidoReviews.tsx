import { type Ref, useMemo } from "react";
import {
	AK,
	type Cloud,
	cloudShape,
	createRng,
	FONT_MONO,
	FONT_SANS,
	markPath,
	type Rng,
	round,
} from "../../util/aikido";

/**
 * Panel 4 — code review poster: hatched clouds over a stack of coloured
 * hills (grey hatch, yellow with orange dots, violet dashes, green binary).
 */

const SEED = 0x4c0d;

type Hill = {
	/** Flat level the hill falls back to. */
	base: number;
	/** Height of the crest above the flat level. */
	amp: number;
	/** Horizontal position of the crest. */
	peak: number;
	/** How wide the hill spreads. */
	spread: number;
};

const HILLS: Record<"grey" | "yellow" | "violet" | "green", Hill> = {
	grey: { base: 880, amp: 220, peak: 410, spread: 434 },
	yellow: { base: 1000, amp: 309, peak: 1030, spread: 777 },
	violet: { base: 995, amp: 246, peak: 1075, spread: 500 },
	green: { base: 992, amp: 180, peak: 1100, spread: 381 },
};

const hillY = (h: Hill, x: number) =>
	h.base - h.amp * Math.exp(-(((x - h.peak) / h.spread) ** 2));

function hillPath(h: Hill) {
	const pts: string[] = [];
	for (let x = -10; x <= 1610; x += 8) {
		pts.push(`${round(x)} ${round(hillY(h, x))}`);
	}
	return `M-10 960L${pts.join("L")}L1610 960Z`;
}

/** A dashed line that follows a hill, offset below the crest. */
function followHill(h: Hill, offset: number) {
	const pts: string[] = [];
	for (let x = -10; x <= 1610; x += 10) {
		pts.push(`${round(x)} ${round(hillY(h, x) + offset)}`);
	}
	return `M${pts.join("L")}`;
}

/** The band between the crest and `thickness` below it, as a closed path. */
function crestBand(h: Hill, thickness: number) {
	const top: string[] = [];
	const bottom: string[] = [];
	for (let x = -10; x <= 1610; x += 8) {
		top.push(`${round(x)} ${round(hillY(h, x))}`);
		bottom.unshift(`${round(x)} ${round(hillY(h, x) + thickness)}`);
	}
	return `M${top.join("L")}L${bottom.join("L")}Z`;
}

const CLOUDS = [
	{ x: 55, y: 26, w: 375, h: 108, lumps: 5, tick: 34 },
	{ x: -40, y: 166, w: 285, h: 78, lumps: 4, tick: 28 },
	{ x: 265, y: 212, w: 190, h: 60, lumps: 3, tick: 26 },
	{ x: 1115, y: 34, w: 180, h: 78, lumps: 3, tick: 30 },
	{ x: 1215, y: 164, w: 315, h: 52, lumps: 5, tick: 24 },
	{ x: 1350, y: 268, w: 260, h: 44, lumps: 4, tick: 22 },
];

export function AikidoReviews({ svgRef }: { svgRef?: Ref<SVGSVGElement> }) {
	const rng: Rng = useMemo(() => createRng(SEED), []);
	const clouds: Cloud[] = useMemo(
		() => CLOUDS.map((spec) => cloudShape(rng, { ...spec, lumps: spec.lumps })),
		[rng],
	);

	const ids = "aikido-reviews";
	const clip = (name: string) => `url(#${ids}-${name})`;

	return (
		<svg
			ref={svgRef}
			viewBox="0 0 1600 960"
			width="100%"
			height="100%"
			role="img"
			aria-label="Aikido code review poster with clouds and coloured hills"
		>
			<defs>
				<clipPath id={`${ids}-grey`}>
					<path d={hillPath(HILLS.grey)} />
				</clipPath>
				<clipPath id={`${ids}-yellow`}>
					<path d={hillPath(HILLS.yellow)} />
				</clipPath>
				<clipPath id={`${ids}-green`}>
					<path d={hillPath(HILLS.green)} />
				</clipPath>
				<pattern
					id={`${ids}-hatch`}
					width={44}
					height={44}
					patternUnits="userSpaceOnUse"
				>
					<rect
						x={2}
						y={2}
						width={7}
						height={26}
						fill="#5d5d5b"
						transform="rotate(38 5.5 15)"
					/>
				</pattern>
				<pattern
					id={`${ids}-dots`}
					width={22}
					height={22}
					patternUnits="userSpaceOnUse"
				>
					<rect width={10} height={10} fill={AK.orange} />
				</pattern>
				<pattern
					id={`${ids}-greenhatch`}
					width={26}
					height={26}
					patternUnits="userSpaceOnUse"
				>
					<line
						x1={0}
						y1={26}
						x2={26}
						y2={0}
						stroke="#0b5c3d"
						strokeWidth={2.4}
					/>
				</pattern>
			</defs>

			<rect width={1600} height={960} fill={AK.paper} />

			{/* clouds */}
			{clouds.map((c) => (
				<g key={c.d.slice(0, 24)}>
					<path d={c.d} fill={AK.paper} stroke={AK.ink} strokeWidth={2} />
					<g stroke={AK.ink} strokeWidth={1.2}>
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

			{/* grey hatched hill */}
			<g clipPath={clip("grey")}>
				<rect width={1600} height={960} fill={AK.paper} />
				<rect width={1600} height={960} fill={`url(#${ids}-hatch)`} />
			</g>

			{/* yellow hill, with a band of orange dots under its crest */}
			<g clipPath={clip("yellow")}>
				<rect width={1600} height={960} fill={AK.yellow} />
				<path d={crestBand(HILLS.yellow, 52)} fill={`url(#${ids}-dots)`} />
			</g>

			{/* violet tick on the yellow */}
			<rect x={342} y={772} width={18} height={92} fill={AK.blue} />

			{/* paper band with violet dashes, in front of the yellow */}
			<path d={hillPath(HILLS.violet)} fill={AK.paper} />
			<g fill="none" stroke={AK.violet} strokeWidth={9} strokeDasharray="34 22">
				{[9, 41, 73, 105].map((offset) => (
					<path key={offset} d={followHill(HILLS.violet, offset)} />
				))}
			</g>

			{/* green hill with binary + hatch */}
			<g clipPath={clip("green")}>
				<rect width={1600} height={960} fill={AK.green} />
				<rect
					x={930}
					width={200}
					height={960}
					fill={`url(#${ids}-greenhatch)`}
				/>
			</g>
			<g fontFamily={FONT_MONO} fill="#0b5c3d">
				<text x={700} y={858} fontSize={24}>
					{"+++++++[ ////////////////// ]"}
				</text>
				<text x={840} y={900} fontSize={20}>
					01010101
				</text>
				<text x={700} y={940} fontSize={24}>
					{"++++++++[ ///////////////////// ]"}
				</text>
				<text x={905} y={900} fontSize={30} fill="#0a4d33">
					{"01010101/////"}
				</text>
			</g>
			<rect x={1113} y={800} width={13} height={160} fill="#e2450f" />

			{/* logo + headline */}
			<g transform="translate(704 274)">
				<path d={markPath(45)} fill={AK.ink} />
				<text
					x={63}
					y={45}
					fontFamily={FONT_SANS}
					fontSize={44}
					fontWeight={700}
					letterSpacing="-0.02em"
					fill={AK.ink}
				>
					aikido
				</text>
			</g>
			<g
				fontFamily={FONT_SANS}
				fontSize={69.5}
				fontWeight={500}
				letterSpacing="-0.025em"
				fill={AK.ink}
				textAnchor="middle"
			>
				<text x={803} y={409}>
					Code reviews that fix
				</text>
				<text x={803} y={489}>
					your code, not just
				</text>
				<text x={803} y={569}>
					comment on it.
				</text>
			</g>
		</svg>
	);
}

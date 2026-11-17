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
	/** Flat level the hill rises from. */
	base: number;
	/** Height of the crest above the flat level. */
	amp: number;
	/** Horizontal position of the crest. */
	peak: number;
	/** How wide the hill spreads. */
	spread: number;
};

const HILLS: Record<"grey" | "yellow" | "violet" | "green", Hill> = {
	grey: { base: 960, amp: 380, peak: 430, spread: 700 },
	yellow: { base: 985, amp: 425, peak: 1020, spread: 900 },
	violet: { base: 995, amp: 380, peak: 1120, spread: 860 },
	green: { base: 1010, amp: 325, peak: 1200, spread: 820 },
};

const hillY = (h: Hill, x: number) =>
	h.base - h.amp * Math.exp(-(((x - h.peak) / h.spread) ** 2));

function hillPath(h: Hill) {
	const pts: string[] = [];
	for (let x = -10; x <= 1610; x += 12) {
		pts.push(`${round(x)} ${round(hillY(h, x))}`);
	}
	return `M-10 960L${pts.join("L")}L1610 960Z`;
}

/** A dashed line that follows a hill, offset below the crest. */
function followHill(h: Hill, offset: number) {
	const pts: string[] = [];
	for (let x = -10; x <= 1610; x += 14) {
		pts.push(`${round(x)} ${round(hillY(h, x) + offset)}`);
	}
	return `M${pts.join("L")}`;
}

/** The band between the crest and `thickness` below it, as a closed path. */
function crestBand(h: Hill, thickness: number) {
	const top: string[] = [];
	const bottom: string[] = [];
	for (let x = -10; x <= 1610; x += 12) {
		top.push(`${round(x)} ${round(hillY(h, x))}`);
		bottom.unshift(`${round(x)} ${round(hillY(h, x) + thickness)}`);
	}
	return `M${top.join("L")}L${bottom.join("L")}Z`;
}

const CLOUDS = [
	{ x: 50, y: 26, w: 380, h: 108, lumps: 5, tick: 34 },
	{ x: -10, y: 168, w: 260, h: 76, lumps: 4, tick: 28 },
	{ x: 280, y: 214, w: 190, h: 76, lumps: 3, tick: 28 },
	{ x: 1090, y: 40, w: 170, h: 78, lumps: 3, tick: 30 },
	{ x: 1180, y: 166, w: 320, h: 66, lumps: 4, tick: 26 },
	{ x: 1320, y: 272, w: 300, h: 62, lumps: 4, tick: 24 },
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
					width={34}
					height={34}
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(42)"
				>
					<rect width={15} height={34} fill="#6e6d6a" />
				</pattern>
				<pattern
					id={`${ids}-dots`}
					width={26}
					height={26}
					patternUnits="userSpaceOnUse"
				>
					<rect width={9} height={9} fill={AK.orange} />
				</pattern>
				<pattern
					id={`${ids}-greenhatch`}
					width={22}
					height={22}
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(38)"
				>
					<rect width={2.6} height={22} fill="#0b7d54" />
				</pattern>
			</defs>

			<rect width={1600} height={960} fill="#f0efec" />

			{/* clouds */}
			{clouds.map((c) => (
				<g key={c.d.slice(0, 24)}>
					<path d={c.d} fill="#f0efec" stroke={AK.ink} strokeWidth={2} />
					<g stroke={AK.ink} strokeWidth={1.3}>
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
				<rect width={1600} height={960} fill="#f0efec" />
				<rect width={1600} height={960} fill={`url(#${ids}-hatch)`} />
			</g>

			{/* yellow hill with orange dots */}
			<g clipPath={clip("yellow")}>
				<rect width={1600} height={960} fill={AK.yellow} />
				<path d={crestBand(HILLS.yellow, 130)} fill={`url(#${ids}-dots)`} />
			</g>
			{/* blue tick */}
			<rect x={342} y={775} width={18} height={88} fill={AK.blue} />

			{/* violet hill */}
			<path d={hillPath(HILLS.violet)} fill={AK.white} />
			<g
				fill="none"
				stroke={AK.violet}
				strokeWidth={11}
				strokeDasharray="34 22"
			>
				{[6, 34, 62, 90].map((offset) => (
					<path key={offset} d={followHill(HILLS.violet, offset)} />
				))}
			</g>

			{/* green hill with binary + hatch */}
			<g clipPath={clip("green")}>
				<rect width={1600} height={960} fill={AK.green} />
				<rect
					x={1080}
					width={520}
					height={960}
					fill={`url(#${ids}-greenhatch)`}
				/>
				<rect x={1096} width={13} height={960} fill="#e2450f" />
			</g>
			<g fontFamily={FONT_MONO} fill="#0b6b47">
				<text x={700} y={828} fontSize={26}>
					{"+++++++[ ////////////////// ]"}
				</text>
				<text x={840} y={872} fontSize={22}>
					01010101
				</text>
				<text x={700} y={900} fontSize={26}>
					{"++++++++[ ///////////////////// ]"}
				</text>
				<text x={980} y={846} fontSize={34} fill="#0a5d3c">
					{"01010101/////"}
				</text>
			</g>

			{/* logo + headline */}
			<g transform="translate(742 272)">
				<path d={markPath(34)} fill={AK.ink} />
				<text
					x={44}
					y={31}
					fontFamily={FONT_SANS}
					fontSize={32}
					fontWeight={700}
					letterSpacing="-0.02em"
					fill={AK.ink}
				>
					aikido
				</text>
			</g>
			<g
				fontFamily={FONT_SANS}
				fontSize={68}
				fontWeight={500}
				letterSpacing="-0.025em"
				fill={AK.ink}
				textAnchor="middle"
			>
				<text x={800} y={400}>
					Code reviews that fix
				</text>
				<text x={800} y={471}>
					your code, not just
				</text>
				<text x={800} y={542}>
					comment on it.
				</text>
			</g>
		</svg>
	);
}

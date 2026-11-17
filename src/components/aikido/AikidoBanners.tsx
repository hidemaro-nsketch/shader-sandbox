import { type Ref, useMemo } from "react";
import {
	AK,
	createRng,
	FONT_MONO,
	FONT_SANS,
	markPath,
	type Rng,
	range,
	round,
} from "../../util/aikido";

/**
 * Panel 2 — banner pair on orange: a dark "code tunnel" and a light
 * "deep PR review" card where a bug-filled sphere is filtered down to the
 * shipped code.
 */

const SEED = 0x2b87;

const CARD_A = { x: 154, y: 135, w: 579, h: 689 };
const CARD_B = { x: 766, y: 135, w: 678, h: 689 };

/** Dark card: brick wall of code blocks. */
function useBricks(rng: Rng) {
	return useMemo(() => {
		const bricks: { x: number; y: number; w: number }[] = [];
		const left = CARD_A.x + 6;
		const top = CARD_A.y + 4;
		const width = CARD_A.w - 12;
		const height = CARD_A.h - 8;
		const rowH = 34;
		for (let row = 0; row * rowH < height; row++) {
			const offset = row % 2 === 0 ? -52 : 4;
			for (let x = offset; x < width; x += 100) {
				bricks.push({
					x: round(left + x),
					y: round(top + row * rowH + 5),
					w: round(92 + range(rng, -6, 6)),
				});
			}
		}
		return bricks;
	}, [rng]);
}

/** Blue "bug" confetti inside the sphere. */
function useConfetti(rng: Rng) {
	return useMemo(() => {
		const dots: { x: number; y: number; s: number }[] = [];
		for (let i = 0; i < 190; i++) {
			const a = rng() * Math.PI * 2;
			const r = Math.sqrt(rng());
			dots.push({
				x: round(1066 + Math.cos(a) * r * 100),
				y: round(447 + Math.sin(a) * r * 128),
				s: round(range(rng, 6, 12)),
			});
		}
		return dots;
	}, [rng]);
}

/** Concentric arcs of the dark card: the "code tunnel". */
function tunnelArcs() {
	const arcs: { d: string; violet: boolean; offset: number }[] = [];
	const cx = 462;
	const cy = 1210;
	for (let i = 0; i < 18; i++) {
		const r = 1020 - i * 36;
		const a0 = (-175 * Math.PI) / 180;
		const a1 = (-5 * Math.PI) / 180;
		const x0 = cx + r * Math.cos(a0);
		const y0 = cy + r * Math.sin(a0);
		const x1 = cx + r * Math.cos(a1);
		const y1 = cy + r * Math.sin(a1);
		arcs.push({
			d: `M${round(x0)} ${round(y0)}A${r} ${r} 0 0 1 ${round(x1)} ${round(y1)}`,
			violet: i >= 9 && i <= 14,
			offset: i * 23,
		});
	}
	return arcs;
}

/** Pale brick rows of the light card, laid out along wide arcs. */
function reviewArcs() {
	const arcs: { d: string; width: number }[] = [];
	const cx = 1040;
	const cy = 1560;
	for (let i = 0; i < 9; i++) {
		const r = 780 + i * 56;
		const a0 = (-168 * Math.PI) / 180;
		const a1 = (-14 * Math.PI) / 180;
		arcs.push({
			d: `M${round(cx + r * Math.cos(a0))} ${round(cy + r * Math.sin(a0))}A${r} ${r} 0 0 1 ${round(cx + r * Math.cos(a1))} ${round(cy + r * Math.sin(a1))}`,
			width: i % 2 === 0 ? 22 : 18,
		});
	}
	return arcs;
}

function PanelLogo({
	x,
	y,
	h,
	color,
	wordSize,
}: {
	x: number;
	y: number;
	h: number;
	color: string;
	wordSize: number;
}) {
	return (
		<g transform={`translate(${x} ${y})`}>
			<path d={markPath(h)} fill={color} />
			<text
				x={h * (47 / 40) + 10}
				y={h * 0.95}
				fontFamily={FONT_SANS}
				fontSize={wordSize}
				fontWeight={700}
				letterSpacing="-0.02em"
				fill={color}
			>
				aikido
			</text>
		</g>
	);
}

export function AikidoBanners({ svgRef }: { svgRef?: Ref<SVGSVGElement> }) {
	const rng = useMemo(() => createRng(SEED), []);
	const bricks = useBricks(rng);
	const confetti = useConfetti(rng);
	const arcs = useMemo(tunnelArcs, []);
	const rings = useMemo(reviewArcs, []);

	const ids = "aikido-banners";
	const clip = (name: string) => `url(#${ids}-${name})`;

	return (
		<svg
			ref={svgRef}
			viewBox="0 0 1600 960"
			width="100%"
			height="100%"
			role="img"
			aria-label="Two Aikido banners on an orange field"
		>
			<defs>
				<clipPath id={`${ids}-dark`}>
					<rect x={CARD_A.x} y={CARD_A.y} width={CARD_A.w} height={CARD_A.h} />
				</clipPath>
				<clipPath id={`${ids}-light`}>
					<rect x={CARD_B.x} y={CARD_B.y} width={CARD_B.w} height={CARD_B.h} />
				</clipPath>
				<clipPath id={`${ids}-sphere`}>
					<ellipse cx={1055} cy={447} rx={96} ry={130} />
				</clipPath>
				<clipPath id={`${ids}-code`}>
					<rect x={1160} y={330} width={64} height={234} />
				</clipPath>
				<clipPath id={`${ids}-tunnel`}>
					<rect x={CARD_A.x} y={CARD_A.y} width={CARD_A.w} height={560} />
				</clipPath>
			</defs>

			<rect width={1600} height={960} fill={AK.orange} />

			{/* ── dark card ────────────────────────────────────────────── */}
			<g clipPath={clip("dark")}>
				<rect
					x={CARD_A.x}
					y={CARD_A.y}
					width={CARD_A.w}
					height={CARD_A.h}
					fill={AK.night}
				/>
				<g fill="none" stroke="#2d2d2d" strokeWidth={1.6}>
					{bricks.map((b) => (
						<rect
							key={`${b.x}-${b.y}`}
							x={b.x}
							y={b.y}
							width={b.w}
							height={27}
							rx={13}
						/>
					))}
				</g>

				{/* the tunnel of dashed arcs */}
				<g clipPath={clip("tunnel")}>
					{arcs.map((arc) => (
						<path
							key={arc.d.slice(0, 22)}
							d={arc.d}
							fill="none"
							stroke={arc.violet ? AK.violet : AK.yellow}
							strokeWidth={12}
							strokeDasharray="58 10"
							strokeDashoffset={arc.offset}
						/>
					))}
				</g>
			</g>

			{/* dark card footer */}
			<PanelLogo x={182} y={732} h={26} color={AK.paper} wordSize={26} />
			<g fontFamily={FONT_SANS} fontSize={15} fill={AK.paper}>
				<text x={330} y={740}>
					Secure your code,
				</text>
				<text x={330} y={761}>
					cloud, and runtime in
				</text>
				<text x={330} y={782}>
					one central system.
				</text>
				<text x={530} y={740}>
					Find and fix vulnerabilities
				</text>
				<text x={530} y={761}>
					fast automatically.
				</text>
			</g>

			{/* ── light card ───────────────────────────────────────────── */}
			<g clipPath={clip("light")}>
				<rect
					x={CARD_B.x}
					y={CARD_B.y}
					width={CARD_B.w}
					height={CARD_B.h}
					fill={AK.paper}
				/>

				{/* pale brick rows */}
				<g fill="none" stroke="#e8e8e6" strokeDasharray="56 11">
					{rings.map((ring) => (
						<path
							key={ring.d.slice(0, 30)}
							d={ring.d}
							strokeWidth={ring.width}
						/>
					))}
				</g>

				{/* capsule outlines at both edges */}
				<g fill="none" stroke="#cfcfcd" strokeWidth={1.6}>
					<ellipse cx={752} cy={420} rx={86} ry={206} />
					<ellipse cx={746} cy={420} rx={120} ry={232} />
					<ellipse cx={1462} cy={420} rx={86} ry={206} />
					<ellipse cx={1468} cy={420} rx={120} ry={232} />
				</g>
			</g>

			{/* aikido wordmark */}
			<PanelLogo x={1005} y={183} h={32} color={AK.ink} wordSize={38} />

			{/* the filtered sphere */}
			<g>
				{/* violet capsules above and below */}
				<rect x={1040} y={291} width={106} height={30} fill={AK.violet} />
				<rect x={1040} y={573} width={106} height={30} fill={AK.violet} />

				<ellipse cx={1055} cy={447} rx={96} ry={130} fill={AK.yellow} />
				<g clipPath={clip("sphere")}>
					{confetti.map((d) => (
						<rect
							key={`${d.x}-${d.y}`}
							x={d.x}
							y={d.y}
							width={d.s}
							height={d.s}
							fill={AK.blue}
						/>
					))}
					{/* beach-ball seams */}
					<g fill="none" stroke="#e9e9e7" strokeWidth={2}>
						<path d="M1010 320a120 128 0 0 1 0 258" />
						<path d="M1052 316a112 131 0 0 1 0 262" />
					</g>
					{/* violet filter over the right third */}
					<path
						d="M1100 320a112 127 0 0 1 0 254l40 0 0-254z"
						fill={AK.violet}
					/>
					{/* shipped code strip */}
					<g clipPath={clip("code")}>
						<rect x={1160} y={330} width={56} height={234} fill={AK.green} />
					</g>
				</g>
				<ellipse
					cx={1055}
					cy={447}
					rx={96}
					ry={130}
					fill="none"
					stroke="#d2d2d0"
					strokeWidth={1.6}
				/>
				<g
					fontFamily={FONT_MONO}
					fontSize={17}
					fill="#0a5c3e"
					textAnchor="middle"
				>
					{[-2, 20, 202].map((label, i) => (
						<text key={label} x={1194} y={360 + i * 30}>
							{label}
						</text>
					))}
					{[-2, 202, 20].map((label, i) => (
						<text key={`b${label}`} x={1194} y={470 + i * 30}>
							{label}
						</text>
					))}
				</g>
			</g>

			{/* callouts */}
			<g
				fontFamily={FONT_MONO}
				fontSize={17}
				fill={AK.ink}
				letterSpacing="0.03em"
			>
				<rect x={862} y={316} width={12} height={12} fill={AK.orange} />
				<text x={884} y={329}>
					BUGS FOUND
				</text>
				<path
					d="M900 336v56h46"
					fill="none"
					stroke={AK.ink}
					strokeWidth={1.6}
				/>
				<rect x={1256} y={557} width={12} height={12} fill={AK.orange} />
				<text x={1278} y={570}>
					SHIPPED CODE
				</text>
				<path
					d="M1262 553v-38h-58"
					fill="none"
					stroke={AK.ink}
					strokeWidth={1.6}
				/>
			</g>

			{/* caption */}
			<text
				x={1106}
				y={757}
				fontFamily={FONT_MONO}
				fontSize={19}
				letterSpacing="0.14em"
				fill={AK.ink}
				textAnchor="middle"
			>
				DEEP PR REVIEW
			</text>
			<text
				x={1106}
				y={789}
				fontFamily={FONT_SANS}
				fontSize={19}
				fill="#8b8884"
				textAnchor="middle"
			>
				Only finds bugs that are relevant
			</text>
		</svg>
	);
}

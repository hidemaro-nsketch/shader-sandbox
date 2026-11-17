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

/** Dark panel: brick wall of code blocks. */
function useBricks(rng: Rng) {
	return useMemo(() => {
		const blocks: { x: number; y: number; w: number }[] = [];
		const left = 157;
		const top = 141;
		const width = 560;
		const height = 665;
		for (let row = 0; row * 44 < height; row++) {
			const offset = row % 2 === 0 ? -30 : 18;
			for (let x = offset; x < width; x += range(rng, 96, 118)) {
				blocks.push({
					x: round(left + x),
					y: round(top + 18 + row * 44),
					w: round(range(rng, 74, 104)),
				});
			}
		}
		return blocks;
	}, [rng]);
}

/** Blue "bug" confetti inside the sphere. */
function useConfetti(rng: Rng) {
	return useMemo(() => {
		const dots: { x: number; y: number; s: number }[] = [];
		for (let i = 0; i < 210; i++) {
			const a = rng() * Math.PI * 2;
			const r = Math.sqrt(rng());
			dots.push({
				x: round(1015 + Math.cos(a) * r * 88),
				y: round(410 + Math.sin(a) * r * 128),
				s: round(range(rng, 6, 13)),
			});
		}
		return dots;
	}, [rng]);
}

/** Concentric arcs: the "code tunnel" of the dark panel. */
function tunnelArcs() {
	const arcs: { d: string; violet: boolean }[] = [];
	const cx = 600;
	const cy = 1150;
	for (let i = 0; i < 20; i++) {
		const r = 1010 - i * 40;
		const a0 = (-172 * Math.PI) / 180;
		const a1 = (-8 * Math.PI) / 180;
		const x0 = cx + r * Math.cos(a0);
		const y0 = cy + r * Math.sin(a0);
		const x1 = cx + r * Math.cos(a1);
		const y1 = cy + r * Math.sin(a1);
		arcs.push({
			d: `M${round(x0)} ${round(y0)}A${r} ${r} 0 0 1 ${round(x1)} ${round(y1)}`,
			violet: i >= 8 && i <= 13,
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
	const w = h / (40 / 47);
	return (
		<g transform={`translate(${x} ${y})`}>
			<path d={markPath(w)} fill={color} />
			<text
				x={w + 12}
				y={h * 0.92}
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

	const ids = "aikido-banners";
	const clips = {
		dark: `${ids}-dark`,
		light: `${ids}-light`,
		sphere: `${ids}-sphere`,
		code: `${ids}-code`,
	};

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
				<clipPath id={clips.dark}>
					<rect x={157} y={141} width={560} height={665} />
				</clipPath>
				<clipPath id={`${ids}-tunnel`}>
					<rect x={157} y={141} width={560} height={560} />
				</clipPath>
				<clipPath id={clips.light}>
					<rect x={746} y={149} width={810} height={649} />
				</clipPath>
				<clipPath id={clips.sphere}>
					<ellipse cx={1015} cy={410} rx={90} ry={130} />
				</clipPath>
				<clipPath id={clips.code}>
					<rect x={1072} y={300} width={38} height={224} />
				</clipPath>
			</defs>

			<rect width={1600} height={960} fill={AK.orange} />

			{/* ── dark panel ───────────────────────────────────────────── */}
			<g clipPath={`url(#${clips.dark})`}>
				<rect x={157} y={141} width={560} height={665} fill="#1b1b1a" />
				{bricks.map((b) => (
					<rect
						key={`${b.x}-${b.y}`}
						x={b.x}
						y={b.y}
						width={b.w}
						height={30}
						rx={13}
						fill="#262625"
					/>
				))}
			</g>

			{/* the tunnel of dashed arcs */}
			<g clipPath={`url(#${ids}-tunnel)`}>
				{arcs.map((arc) => (
					<path
						key={arc.d.slice(0, 22)}
						d={arc.d}
						fill="none"
						stroke={arc.violet ? AK.violet : AK.yellow}
						strokeWidth={12}
						strokeDasharray="38 12"
					/>
				))}
			</g>

			{/* dark panel footer */}
			<PanelLogo x={182} y={726} h={26} color={AK.paper} wordSize={25} />
			<g fontFamily={FONT_SANS} fontSize={12.5} fill={AK.paper}>
				<text x={330} y={736}>
					Secure your code,
				</text>
				<text x={330} y={753}>
					cloud, and runtime in
				</text>
				<text x={330} y={770}>
					one central system.
				</text>
				<text x={530} y={736}>
					Find and fix vulnerabilities
				</text>
				<text x={530} y={753}>
					fast automatically.
				</text>
			</g>

			{/* ── light panel ──────────────────────────────────────────── */}
			<g clipPath={`url(#${clips.light})`}>
				<rect x={746} y={149} width={810} height={649} fill={AK.paper} />

				{/* pale contour arcs */}
				<g
					fill="none"
					stroke="#eae8e5"
					strokeWidth={18}
					strokeDasharray="52 18"
				>
					{Array.from({ length: 7 }, (_, i) => {
						const r = 1080 - i * 52;
						const cx = 640;
						const cy = 1080;
						const a0 = (-168 * Math.PI) / 180;
						const a1 = (-12 * Math.PI) / 180;
						return (
							<path
								key={r}
								d={`M${round(cx + r * Math.cos(a0))} ${round(cy + r * Math.sin(a0))}A${r} ${r} 0 0 1 ${round(cx + r * Math.cos(a1))} ${round(cy + r * Math.sin(a1))}`}
							/>
						);
					})}
				</g>
				<g fill="none" stroke="#dbd8d4" strokeWidth={1.6}>
					<ellipse cx={880} cy={400} rx={150} ry={215} />
					<ellipse cx={880} cy={400} rx={182} ry={250} />
					<ellipse cx={1420} cy={410} rx={150} ry={215} />
					<ellipse cx={1420} cy={410} rx={182} ry={250} />
				</g>

				{/* violet capsule behind the sphere */}
				<rect
					x={1002}
					y={284}
					width={112}
					height={254}
					rx={14}
					fill={AK.violet}
				/>
			</g>

			{/* aikido wordmark */}
			<PanelLogo x={1000} y={176} h={30} color={AK.ink} wordSize={30} />

			{/* the filtered sphere */}
			<g>
				<ellipse cx={1015} cy={410} rx={90} ry={130} fill={AK.yellow} />
				<g clipPath={`url(#${clips.sphere})`}>
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
				</g>
				{/* violet filter covering the right side */}
				<path
					d="M1032 280a94 132 0 0 1 0 260z"
					fill={AK.violet}
					opacity={0.96}
				/>
				{/* shipped code strip */}
				<g clipPath={`url(#${clips.code})`}>
					<rect x={1072} y={300} width={44} height={224} fill={AK.green} />
					<g
						fontFamily={FONT_MONO}
						fontSize={15}
						fill="#0a6b4c"
						textAnchor="middle"
					>
						<text x={1094} y={322}>
							2
						</text>
						<text x={1094} y={352}>
							2
						</text>
						<text x={1094} y={382}>
							2
						</text>
						<text x={1094} y={412}>
							202
						</text>
						<text x={1094} y={442}>
							202
						</text>
						<text x={1094} y={472}>
							202
						</text>
						<text x={1094} y={502}>
							2
						</text>
					</g>
				</g>
				<ellipse
					cx={1015}
					cy={410}
					rx={90}
					ry={130}
					fill="none"
					stroke="#e2ded9"
					strokeWidth={2}
				/>
			</g>

			{/* callouts */}
			<g
				fontFamily={FONT_MONO}
				fontSize={14}
				fill={AK.ink}
				letterSpacing="0.04em"
			>
				<rect x={824} y={322} width={11} height={11} fill={AK.orange} />
				<text x={844} y={333}>
					BUGS FOUND
				</text>
				<path
					d="M880 338v52h42"
					fill="none"
					stroke={AK.ink}
					strokeWidth={1.4}
				/>
				<rect x={1204} y={556} width={11} height={11} fill={AK.orange} />
				<text x={1224} y={567}>
					SHIPPED CODE
				</text>
				<path
					d="M1210 548v-28h-92"
					fill="none"
					stroke={AK.ink}
					strokeWidth={1.4}
				/>
			</g>

			{/* caption */}
			<g fontFamily={FONT_MONO} textAnchor="middle">
				<text
					x={1151}
					y={735}
					fontSize={15}
					letterSpacing="0.16em"
					fill={AK.ink}
				>
					DEEP PR REVIEW
				</text>
			</g>
			<text
				x={1151}
				y={762}
				fontFamily={FONT_SANS}
				fontSize={17}
				fill="#8b8884"
				textAnchor="middle"
			>
				Only finds bugs that are relevant
			</text>
		</svg>
	);
}

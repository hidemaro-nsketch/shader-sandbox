import { type Ref, useMemo } from "react";
import { AK, createRng, type Rng, range, round } from "../../util/aikido";

/**
 * Panel 6 — blog hero: a radial burst of grey bars around a black card, with
 * an orange slice where the "attack" lands, on a field of tiny zeros.
 */

const SEED = 0x6b11;
const CENTER = { x: 810, y: 480 };

/** Layers in paint order: background, grain, halo, bars, orange, card, masthead. */
export const STAGE_COUNT = 7;

type Bar = {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	hot: boolean;
	width: number;
};

function useBurst(rng: Rng) {
	return useMemo(() => {
		const bars: Bar[] = [];
		const count = 230;
		for (let i = 0; i < count; i++) {
			const deg = (i / count) * 360 + range(rng, -1.0, 1.0);
			const rad = (deg * Math.PI) / 180;
			const r0 = range(rng, 130, 300);
			const len = range(rng, 50, 200);
			const hot =
				(deg > 150 && deg < 215) ||
				(deg > 240 && deg < 272) ||
				(deg > 296 && deg < 336) ||
				(deg > 56 && deg < 90);
			bars.push({
				x1: round(CENTER.x + Math.sin(rad) * r0),
				y1: round(CENTER.y - Math.cos(rad) * r0),
				x2: round(CENTER.x + Math.sin(rad) * (r0 + len)),
				y2: round(CENTER.y - Math.cos(rad) * (r0 + len)),
				hot,
				width: round(range(rng, 7, 11)),
			});
		}
		return bars;
	}, [rng]);
}

export function AikidoBurst({
	svgRef,
	stage = STAGE_COUNT,
}: {
	svgRef?: Ref<SVGSVGElement>;
	/** Draw only the first `stage` layers (1..STAGE_COUNT); default is the full piece. */
	stage?: number;
}) {
	const rng = useMemo(() => createRng(SEED), []);
	const bars = useBurst(rng);
	const ids = "aikido-burst";

	return (
		<svg
			ref={svgRef}
			viewBox="0 0 1600 960"
			width="100%"
			height="100%"
			role="img"
			aria-label="Aikido blog hero with a radial burst of bars"
		>
			<defs>
				<pattern
					id={`${ids}-grain`}
					width={26}
					height={26}
					patternUnits="userSpaceOnUse"
				>
					<circle
						cx={13}
						cy={13}
						r={2.6}
						fill="none"
						stroke="#262626"
						strokeWidth={1.4}
					/>
				</pattern>
			</defs>

			{stage >= 1 && <rect width={1600} height={960} fill="#1d1d1d" />}
			{stage >= 2 && (
				<rect width={1600} height={960} fill={`url(#${ids}-grain)`} />
			)}

			{/* faint halo behind the burst */}
			{stage >= 3 && (
				<circle
					cx={CENTER.x}
					cy={CENTER.y}
					r={270}
					fill="none"
					stroke="#1e1e1d"
					strokeWidth={2}
				/>
			)}

			{stage >= 4 && (
				<g strokeLinecap="butt">
					{bars.map((b) => (
						<line
							key={`${b.x2}-${b.y2}`}
							x1={b.x1}
							y1={b.y1}
							x2={b.x2}
							y2={b.y2}
							stroke={b.hot && stage >= 5 ? AK.orange : "#3a3a3a"}
							strokeWidth={b.width}
							strokeDasharray="44 7"
						/>
					))}
				</g>
			)}

			{/* card */}
			{stage >= 6 && (
				<rect x={537} y={345} width={533} height={255} rx={20} fill="#191919" />
			)}

			{/* masthead */}
			{stage >= 7 && (
				<rect x={365} y={52} width={212} height={40} rx={8} fill="#242423" />
			)}
		</svg>
	);
}

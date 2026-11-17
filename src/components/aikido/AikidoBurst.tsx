import { type Ref, useMemo } from "react";
import {
	AK,
	createRng,
	FONT_MONO,
	FONT_SANS,
	type Rng,
	range,
	round,
} from "../../util/aikido";

/**
 * Panel 6 — blog hero: a radial burst of grey bars around a black card, with
 * an orange slice where the "attack" lands, on a field of tiny zeros.
 */

const SEED = 0x6b11;
const CENTER = { x: 810, y: 480 };

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

export function AikidoBurst({ svgRef }: { svgRef?: Ref<SVGSVGElement> }) {
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
					id={`${ids}-zeros`}
					width={26}
					height={26}
					patternUnits="userSpaceOnUse"
				>
					<text
						x={3}
						y={18}
						fontFamily={FONT_MONO}
						fontSize={13}
						fill="#242423"
					>
						0
					</text>
				</pattern>
			</defs>

			<rect width={1600} height={960} fill="#1d1d1d" />
			<rect width={1600} height={960} fill={`url(#${ids}-zeros)`} />

			{/* faint halo behind the burst */}
			<circle
				cx={CENTER.x}
				cy={CENTER.y}
				r={270}
				fill="none"
				stroke="#1e1e1d"
				strokeWidth={2}
			/>

			<g strokeLinecap="butt">
				{bars.map((b) => (
					<line
						key={`${b.x2}-${b.y2}`}
						x1={b.x1}
						y1={b.y1}
						x2={b.x2}
						y2={b.y2}
						stroke={b.hot ? AK.orange : "#3a3a3a"}
						strokeWidth={b.width}
						strokeDasharray="44 7"
					/>
				))}
			</g>

			{/* card */}
			<rect x={537} y={345} width={533} height={255} rx={20} fill="#191919" />
			<g
				fontFamily={FONT_SANS}
				fontSize={55}
				letterSpacing="-0.02em"
				fill="#f7f6f4"
				textAnchor="middle"
			>
				<text x={803} y={416}>
					Pentests used to
				</text>
				<text x={803} y={484}>
					take weeks. Yours
				</text>
				<text x={803} y={552}>
					is done today.
				</text>
			</g>

			{/* masthead */}
			<rect x={365} y={52} width={212} height={40} rx={8} fill="#242423" />
			<text x={382} y={79} fontFamily={FONT_MONO} fontSize={16} fill="#dedcd8">
				Blog / Attack
			</text>
			<text
				x={1240}
				y={79}
				fontFamily={FONT_MONO}
				fontSize={16}
				fill="#cfcdc9"
				textAnchor="end"
			>
				Nov 2, 2026
			</text>
		</svg>
	);
}

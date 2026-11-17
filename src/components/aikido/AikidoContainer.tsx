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
 * Panel 3 — "Container × Security": an isometric voxel cube, half dark
 * (container layers) and half blue (running code), sealed with yellow pipes
 * and four orange locks.
 */

const SEED = 0x3c05;

const A = 24; // half cell width
const B = 12; // half cell depth
const C = 15; // voxel height
const N = 13; // cells along a side of the top face
const K = 14; // voxels of height
const CX = 800;
const CY = 411;

type Pt = { x: number; y: number };

const iso = (i: number, j: number, k: number): Pt => ({
	x: CX + (i - j) * A,
	y: CY + (i + j) * B - k * C,
});

const poly = (pts: Pt[]) =>
	pts.map((p) => `${round(p.x)},${round(p.y)}`).join(" ");

function useBackground(rng: Rng) {
	return useMemo(() => {
		const boxes: { x: number; y: number; w: number; h: number }[] = [];
		for (let i = 0; i < 34; i++) {
			boxes.push({
				x: round(range(rng, -20, 1560)),
				y: round(range(rng, 0, 920)),
				w: round(range(rng, 40, 96)),
				h: round(range(rng, 110, 320)),
			});
		}
		return boxes;
	}, [rng]);
}

/** Hexagonal "nut" on the top face of a voxel. */
function VoxelCap({ p, tone }: { p: Pt; tone: number }) {
	const rx = 7.6;
	const ry = 4.4;
	const lift = 7;
	const pts: Pt[] = [
		{ x: p.x - rx, y: p.y },
		{ x: p.x - rx / 2, y: p.y - ry },
		{ x: p.x + rx / 2, y: p.y - ry },
		{ x: p.x + rx, y: p.y },
		{ x: p.x + rx / 2, y: p.y + ry },
		{ x: p.x - rx / 2, y: p.y + ry },
	];
	return (
		<>
			<polygon
				points={poly([
					{ x: p.x - rx, y: p.y },
					{ x: p.x + rx, y: p.y },
					{ x: p.x + rx, y: p.y + lift },
					{ x: p.x - rx, y: p.y + lift },
				])}
				fill="#232322"
			/>
			<polygon
				points={poly(pts)}
				fill={tone > 0.5 ? "#403f3e" : "#373736"}
				stroke="#71706d"
				strokeWidth={0.8}
			/>
			<polygon
				points={poly([
					{ x: p.x - 2.4, y: p.y },
					{ x: p.x, y: p.y - 1.4 },
					{ x: p.x + 2.4, y: p.y },
					{ x: p.x, y: p.y + 1.4 },
				])}
				fill="#1c1c1b"
			/>
		</>
	);
}

function Lock({ p, scale = 1 }: { p: Pt; scale?: number }) {
	const s = 26 * scale;
	return (
		<g>
			<rect
				x={p.x - s / 2}
				y={p.y - s / 2}
				width={s}
				height={s}
				fill={AK.orange}
			/>
			{/* shackle + body */}
			<path
				d={`M${p.x - 5} ${p.y - 2}v-5a5 5 0 0 1 10 0v5`}
				fill="none"
				stroke="#1a1a19"
				strokeWidth={2.6}
			/>
			<rect x={p.x - 7} y={p.y - 2} width={14} height={10} fill="#1a1a19" />
			{/* yellow brackets */}
			<g stroke={AK.yellow} strokeWidth={2.4} fill="none">
				{[-1, 1].map((sx) =>
					[-1, 1].map((sy) => (
						<path
							key={`${sx}${sy}`}
							d={`M${p.x + sx * (s / 2 + 4)} ${p.y + sy * (s / 2 + 4)}h${-sx * 9}`}
						/>
					)),
				)}
				{[-1, 1].map((sx) =>
					[-1, 1].map((sy) => (
						<path
							key={`v${sx}${sy}`}
							d={`M${p.x + sx * (s / 2 + 4)} ${p.y + sy * (s / 2 + 4)}v${-sy * 9}`}
						/>
					)),
				)}
			</g>
		</g>
	);
}

export function AikidoContainer({ svgRef }: { svgRef?: Ref<SVGSVGElement> }) {
	const rng = useMemo(() => createRng(SEED), []);
	const background = useBackground(rng);

	const caps = useMemo(() => {
		const list: { p: Pt; tone: number }[] = [];
		for (let i = 0; i < N; i++) {
			for (let j = 0; j < N; j++) {
				list.push({
					p: iso(i + 0.5, j + 0.5, K),
					tone: rng(),
				});
			}
		}
		return list;
	}, [rng]);

	// Blue voxel faces: +i face on the right, +j face on the left.
	const faces = useMemo(() => {
		const list: { pts: string; tone: number }[] = [];
		for (let k = 0; k < K; k++) {
			for (let n = 0; n < N; n++) {
				const right = [
					iso(N, n, k),
					iso(N, n + 1, k),
					iso(N, n + 1, k + 1),
					iso(N, n, k + 1),
				];
				const left = [
					iso(n, N, k),
					iso(n + 1, N, k),
					iso(n + 1, N, k + 1),
					iso(n, N, k + 1),
				];
				list.push({ pts: poly(right), tone: rng() });
				list.push({ pts: poly(left), tone: rng() });
			}
		}
		return list;
	}, [rng]);

	const waistL = iso(0, N, K);
	const waistB = iso(N, N, K);
	const waistR = iso(N, 0, K);
	const extL = { x: waistL.x - A * 5, y: waistL.y - B * 5 };
	const extR = { x: waistR.x + A * 5, y: waistR.y - B * 5 };

	return (
		<svg
			ref={svgRef}
			viewBox="0 0 1600 960"
			width="100%"
			height="100%"
			role="img"
			aria-label="Aikido container and security voxel cube"
		>
			<rect width={1600} height={960} fill="#191918" />

			<g stroke="#262625" strokeWidth={1.4} fill="none">
				{background.map((b) => (
					<rect
						key={`${b.x}-${b.y}`}
						x={b.x}
						y={b.y}
						width={b.w}
						height={b.h}
					/>
				))}
			</g>

			{/* top face */}
			<g>
				<polygon
					points={poly([
						iso(0, 0, K),
						iso(N, 0, K),
						iso(N, N, K),
						iso(0, N, K),
					])}
					fill="#252524"
				/>
				{caps.map((c) => (
					<VoxelCap key={`${c.p.x}-${c.p.y}`} p={c.p} tone={c.tone} />
				))}
			</g>

			{/* blue faces */}
			<g stroke="#1b46c4" strokeWidth={0.8}>
				{faces.map((f) => (
					<polygon
						key={f.pts}
						points={f.pts}
						fill={f.tone > 0.5 ? "#2f63ff" : "#2a58e6"}
					/>
				))}
			</g>

			{/* yellow pipes along the waist, extended past the corners */}
			<g stroke={AK.yellow} strokeWidth={2.2} fill="none">
				<path
					d={`M${round(extL.x)} ${round(extL.y)}L${round(waistL.x)} ${round(waistL.y)}L${round(waistB.x)} ${round(waistB.y)}L${round(waistR.x)} ${round(waistR.y)}L${round(extR.x)} ${round(extR.y)}`}
				/>
			</g>
			<g fill={AK.yellow}>
				<circle cx={extL.x} cy={extL.y} r={6} />
				<circle cx={waistL.x - A * 2.4} cy={waistL.y - B * 2.4} r={4.2} />
				<circle cx={waistR.x + A * 2.4} cy={waistR.y - B * 2.4} r={4.2} />
				<circle cx={extR.x} cy={extR.y} r={6} />
			</g>

			{/* locks on the blue voxels */}
			<Lock p={iso(1.6, N, 9.4)} />
			<Lock p={iso(N, 3.6, 10.2)} />
			<Lock p={iso(9.2, N, 1.1)} scale={0.86} />
			<Lock p={iso(N, 9.2, 1.1)} scale={0.86} />

			{/* wordmark */}
			<g transform="translate(700 76)">
				<path d={markPath(44)} fill={AK.paper} />
				<text
					x={56}
					y={40}
					fontFamily={FONT_SANS}
					fontSize={42}
					fontWeight={700}
					letterSpacing="-0.02em"
					fill={AK.paper}
				>
					aikido
				</text>
			</g>

			{/* side labels */}
			<g
				fontFamily={FONT_SANS}
				fontSize={64}
				fontWeight={400}
				letterSpacing="-0.02em"
				fill={AK.paper}
			>
				<text x={96} y={512}>
					Container
				</text>
				<text x={1198} y={512}>
					Security
				</text>
			</g>

			{/* caption + button */}
			<g
				fontFamily={FONT_SANS}
				fontSize={24}
				fill="#e6e4e0"
				textAnchor="middle"
			>
				<text x={800} y={770}>
					Scan your container operating system
				</text>
				<text x={800} y={800}>
					for packages with security issues.
				</text>
			</g>
			<rect x={648} y={838} width={304} height={44} rx={6} fill="#2e2e2d" />
			<text
				x={778}
				y={866}
				fontFamily={FONT_MONO}
				fontSize={13}
				letterSpacing="0.1em"
				fill="#dcdad6"
				textAnchor="middle"
			>
				AUTOFIX FOR CONTAINERS
			</text>
			<path
				d="M886 855l5 5-5 5"
				fill="none"
				stroke="#dcdad6"
				strokeWidth={1.6}
			/>
		</svg>
	);
}

/**
 * Procedural 3D surface-plot poster.
 *
 * Recreates the look of a dark data-viz poster: a grid of axonometric
 * wireframe terrains (years × countries × value), each with a mint wall at
 * the far edge, a muted ground plane and small mono annotations.
 */

export const PLOTS_POSTER = { width: 1600, height: 900 } as const;

export const PLOTS_PALETTE = {
	bg: "#111110",
	wire: "#e6e6e2",
	ground: "#57574f",
	fill: "#8fe3a4",
	text: "#ececE8",
	muted: "#8c8c88",
	dim: "#6c6c68",
} as const;

export type SurfaceMetric = {
	id: string;
	/** Two-line title, sans-serif. */
	title: string[];
	/** Mono description lines. */
	subtitle: string[];
	/** Mono source line. */
	source: string;
	/** Rotated axis label ("%", "years", ...). */
	axis: string;
	/** Range printed under the front edge. */
	years: string;
	/** Height field in [0, 1] (t = time 0..1, c = country 0..1). */
	shape: (t: number, c: number) => number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, x: number) => {
	const t = clamp01((x - a) / (b - a));
	return t * t * (3 - 2 * t);
};

/** Deterministic PRNG (mulberry32). */
export function createRng(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Smooth value noise built from a seeded lattice. */
function makeNoise(seed: number) {
	const rng = createRng(seed);
	const size = 16;
	const lattice = Array.from({ length: size * size }, () => rng());
	const at = (x: number, y: number) =>
		lattice[(((y % size) + size) % size) * size + (((x % size) + size) % size)];
	return (x: number, y: number) => {
		const xi = Math.floor(x);
		const yi = Math.floor(y);
		const fx = x - xi;
		const fy = y - yi;
		const sx = fx * fx * (3 - 2 * fx);
		const sy = fy * fy * (3 - 2 * fy);
		const a = at(xi, yi);
		const b = at(xi + 1, yi);
		const c = at(xi, yi + 1);
		const d = at(xi + 1, yi + 1);
		return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
	};
}

export const SURFACE_METRICS: readonly SurfaceMetric[] = [
	{
		id: "poverty",
		title: ["Share of population living in", "extreme poverty"],
		subtitle: ["Long-run estimates, synthetic", "terrain for the sandbox"],
		source: "World Bank",
		axis: "%",
		years: "1990–2024",
		// Flat and low, lifting into a soft mound at the recent edge.
		shape: (t, c) => 0.1 + 0.34 * smoothstep(0.55, 1, t) * (0.4 + 0.6 * c),
	},
	{
		id: "life",
		title: ["Life expectancy"],
		subtitle: ["Long-run estimates across", "synthetic country cohorts"],
		source: "Our World in Data",
		axis: "years",
		years: "1800–2024",
		// Broad rolling plateau that tilts up toward the present.
		shape: (t, c) =>
			0.18 + 0.22 * t + 0.14 * c + 0.1 * Math.sin(t * 5.2 + c * 3.1),
	},
	{
		id: "co2",
		title: ["CO₂ emissions per capita"],
		subtitle: ["Long-run estimates, synthetic", "terrain for the sandbox"],
		source: "Global Carbon Budget",
		axis: "t",
		years: "1800–2024",
		// Low plain rising into a shoulder at the right-hand edge.
		shape: (t, c) =>
			0.12 + 0.5 * smoothstep(0.45, 1, t) * (0.5 + 0.5 * c) ** 1.2,
	},
	{
		id: "gdp",
		title: ["GDP per capita"],
		subtitle: ["Long-run estimates, synthetic", "terrain for the sandbox"],
		source: "Maddison Project",
		axis: "$",
		years: "1800–2024",
		// Nearly flat basin with an exponential spike at the far edge.
		shape: (t, c) => 0.07 + 0.62 * t ** 6 * (0.35 + 0.65 * c),
	},
	{
		id: "undernourished",
		title: ["Share of people who are", "undernourished"],
		subtitle: ["Long-run estimates, synthetic", "terrain for the sandbox"],
		source: "UN FAO",
		axis: "%",
		years: "2001–2024",
		// Mostly flat with a small crumpled ridge near the present.
		shape: (t, c) => 0.08 + 0.26 * smoothstep(0.5, 1, t) * (0.3 + 0.7 * c),
	},
	{
		id: "literacy",
		title: ["Literacy rate"],
		subtitle: ["Long-run estimates across", "synthetic country cohorts"],
		source: "Our World in Data",
		axis: "%",
		years: "1820–2024",
		// A tilted ramp: low at the front-left, high at the back-right.
		shape: (t, c) => 0.1 + 0.5 * t + 0.22 * c,
	},
	{
		id: "electricity",
		title: ["Share of the population with access", "to electricity"],
		subtitle: ["Long-run estimates, synthetic", "terrain for the sandbox"],
		source: "World Bank",
		axis: "%",
		years: "1990–2024",
		// Low shelf that climbs steeply into a cliff at the edge.
		shape: (t) => 0.06 + 0.58 * smoothstep(0.6, 1, t) ** 1.4,
	},
];

export type SurfaceGrid = {
	/** (nx + 1) × (ny + 1) height field, rows = time steps. */
	values: number[][];
};

export function buildSurfaceGrid(
	metric: SurfaceMetric,
	seed: number,
	nx: number,
	ny: number,
): SurfaceGrid {
	const noise = makeNoise(seed);
	const values: number[][] = [];
	for (let i = 0; i <= nx; i++) {
		const t = i / nx;
		const row: number[] = [];
		for (let j = 0; j <= ny; j++) {
			const c = j / ny;
			const n =
				(noise(t * 5.5, c * 3.2) - 0.5) * 0.11 +
				(noise(t * 13, c * 9 + 7) - 0.5) * 0.045;
			row.push(clamp01(metric.shape(t, c) + n));
		}
		values.push(row);
	}
	return { values };
}

// --- Projection ------------------------------------------------------------

/** Value axis height relative to the unit footprint. */
const Z_HEIGHT = 0.62;

/** Oblique axonometric axes (screen-space vectors per unit). */
const AXIS_T = { x: 1, y: 0.17 };
const AXIS_D = { x: 0.58, y: -0.3 };
/** Depth convergence: back rows are slightly narrower (fake perspective). */
const CONVERGE = 0.16;

export type Point2 = [number, number];

/**
 * Oblique axonometric projection of the terrain box: x = time (0..1),
 * y = countries (0..1, front→back), z = value (0..1 up).
 * Returns raw screen coordinates; callers fit the result into a cell.
 */
export function makeProjector(): (x: number, y: number, z: number) => Point2 {
	return (x, y, z) => {
		const u = x * (1 - CONVERGE * y);
		return [
			u * AXIS_T.x + y * AXIS_D.x,
			u * AXIS_T.y + y * AXIS_D.y - z * Z_HEIGHT,
		];
	};
}

/** Fit raw projected points into a target rect, preserving aspect. */
export function makeFit(
	points: Point2[],
	rect: { x: number; y: number; w: number; h: number },
) {
	const xs = points.map((p) => p[0]);
	const ys = points.map((p) => p[1]);
	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);
	const scale = Math.min(rect.w / (maxX - minX), rect.h / (maxY - minY));
	const cx = (minX + maxX) / 2;
	const cy = (minY + maxY) / 2;
	return (p: Point2): Point2 => [
		rect.x + rect.w / 2 + (p[0] - cx) * scale,
		rect.y + rect.h / 2 + (p[1] - cy) * scale,
	];
}

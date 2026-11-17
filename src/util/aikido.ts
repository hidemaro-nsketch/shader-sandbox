/**
 * Shared vocabulary for the Aikido brand experiments (/aikido-*).
 *
 * Six independent compositions that reproduce the campaign explorations:
 * a marketing hero, a banner pair, a container/security voxel cube, a code
 * review poster, an agentic-pentest card and a radial "attack" burst.
 *
 * Everything is drawn in one 1600 x 960 coordinate space.
 */

export const AIKIDO_POSTER = { width: 1600, height: 960 } as const;

export const AK = {
	ink: "#1d1d1d",
	inkSoft: "#2a2a2a",
	paper: "#f2f2f0",
	paperDeep: "#e3e3e1",
	hairline: "#d4d4d3",
	white: "#ffffff",
	orange: "#fa6d01",
	orangeDeep: "#d95b00",
	blue: "#2b5cff",
	violet: "#dc9afd",
	violetDeep: "#b673ea",
	yellow: "#fae501",
	green: "#01cd6e",
	night: "#1d1d1d",
	nightSoft: "#262626",
} as const;

export const FONT_SANS =
	'"Space Grotesk", "Helvetica Neue", Helvetica, Arial, sans-serif';
export const FONT_MONO =
	'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';

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

export type Rng = ReturnType<typeof createRng>;

export const range = (rng: Rng, min: number, max: number) =>
	min + rng() * (max - min);

export const round = (v: number) => Math.round(v * 10) / 10;

/**
 * The aikido mark: a solid bar over an arched chevron with a notch cut out of
 * the bottom. Drawn into a `size` x `size * (40/47)` box.
 */
export function markPath(size: number): string {
	const w = size;
	const h = size * (40 / 47);
	const bar = h * 0.23;
	const shoulder = bar + h * 0.07;
	const apex = shoulder + h * 0.19;
	const notch = shoulder + h * 0.36;
	return [
		`M0 0H${round(w)}V${round(bar)}H0Z`,
		`M0 ${round(h)}`,
		`L0 ${round(shoulder)}`,
		`C${round(w * 0.16)} ${round(apex)} ${round(w * 0.84)} ${round(apex)} ${round(w)} ${round(shoulder)}`,
		`L${round(w)} ${round(h)}`,
		`L${round(w / 2)} ${round(notch)}`,
		"Z",
	].join(" ");
}

/** Mark aspect: height / width. */
export const MARK_RATIO = 40 / 47;

export type CloudSpec = {
	/** Left edge, top of the bounding box. */
	x: number;
	y: number;
	w: number;
	h: number;
	/** Number of lumps along the top edge. */
	lumps?: number;
	/** Length of the hatching ticks that hang from the bottom edge. */
	tick?: number;
};

export type Cloud = {
	/** Closed outline. */
	d: string;
	/** Hatching ticks below the bottom edge. */
	ticks: { x1: number; y1: number; x2: number; y2: number }[];
};

/**
 * Hand-drawn cloud: lumpy top edge, wavy bottom edge, and vertical hatching
 * that hangs below it — the motif used across the campaign.
 */
export function cloudShape(rng: Rng, spec: CloudSpec): Cloud {
	const { x, y, w, h } = spec;
	const lumps = spec.lumps ?? 4;
	const tickLen = spec.tick ?? h * 0.34;

	const bottomY = y + h;
	const wave = h * 0.06;

	// Puffy circular bumps: sampling the max keeps the silhouette organic while
	// the valleys stay crisp, like the cloud motif in the campaign.
	const bumpCount = Math.max(2, lumps);
	const bumps = Array.from({ length: bumpCount }, (_, i) => ({
		c: (i + 0.5) / bumpCount + range(rng, -0.04, 0.04),
		w: range(rng, 0.42, 0.62) / bumpCount,
		a: range(rng, 0.55, 1),
	}));
	const bumpAt = (t: number) => {
		let v = 0;
		for (const b of bumps) {
			const u = (t - b.c) / b.w;
			if (Math.abs(u) >= 1) continue;
			v = Math.max(v, b.a * Math.sqrt(1 - u * u));
		}
		return v;
	};
	const shoulder = y + h * 0.42;
	const crown = y + h * 0.02;
	const topAt = (t: number) => shoulder - (shoulder - crown) * bumpAt(t);

	const bottomAt = (t: number) =>
		bottomY - Math.abs(Math.sin(t * Math.PI * lumps * 1.7)) * wave;

	// Bottom edge left to right, then the lumpy top edge right to left.
	const steps = Math.max(24, Math.round(w / 6));
	let d = "";
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		d += `${i === 0 ? "M" : " L"}${round(x + w * t)} ${round(bottomAt(t))}`;
	}
	for (let i = steps; i >= 0; i--) {
		const t = i / steps;
		d += ` L${round(x + w * t)} ${round(topAt(t))}`;
	}
	d += " Z";

	// Hatching hangs below the bottom edge.
	const ticks: Cloud["ticks"] = [];
	const count = Math.max(8, Math.round(w / 6));
	for (let i = 0; i <= count; i++) {
		const t = i / count;
		const px = x + w * t;
		const py = bottomAt(t);
		ticks.push({
			x1: round(px),
			y1: round(py),
			x2: round(px),
			y2: round(py + tickLen * (0.6 + rng() * 0.7)),
		});
	}

	return { d, ticks };
}

/** Small helper for the tiny `n × n` UI glyphs used inside the mock cards. */
export function chevron(
	x: number,
	y: number,
	size: number,
	dir: "r" | "d" = "r",
) {
	const s = size / 2;
	const d =
		dir === "r"
			? `M${x} ${y - s}L${x + s} ${y}L${x} ${y + s}`
			: `M${x - s} ${y}L${x} ${y + s}L${x + s} ${y}`;
	return d;
}

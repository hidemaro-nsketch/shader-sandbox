/**
 * Procedural "paper chain" poster generator.
 *
 * Recreates the look of Bakers Studio's Collab artworks: a ring of cut-paper
 * figures holding hands, scattered pixel patches, and technical mono labels
 * on a warm charcoal background.
 */

export const POSTER = { width: 1080, height: 1528, cx: 540, cy: 810 } as const;

export const PAPER_PALETTE = {
	bg: "#241f1c",
	cream: "#f2ece3",
	orange: "#f8532a",
	blue: "#2b45e0",
	pink: "#f79ae6",
	yellow: "#f7c62a",
	periwinkle: "#9a93f8",
} as const;

export type PaperPosterOptions = {
	seed: number;
	figureCount: number;
	wordmark: string;
};

export type Figure = {
	x: number;
	y: number;
	/** Rotation in degrees (head points radially outward). */
	angle: number;
	height: number;
	/** Local position of the hand relative to the figure center. */
	handX: number;
	handY: number;
	color: string;
};

export type Patch = {
	x: number;
	y: number;
	cell: number;
	cols: number;
	rows: number;
	base: string;
	accent: string;
	/** 1 = accent cell, 0 = base cell. */
	cells: number[];
	clover?: { cx: number; cy: number; r: number; color: string };
};

export type Label = {
	text: string;
	x: number;
	y: number;
	anchor: "start" | "middle" | "end";
	line?: { x1: number; y1: number; x2: number; y2: number };
	arrow?: boolean;
};

export type PosterLayout = {
	figures: Figure[];
	patches: Patch[];
	labels: Label[];
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

type Rng = ReturnType<typeof createRng>;

const range = (rng: Rng, min: number, max: number) => min + rng() * (max - min);
const pick = <T>(rng: Rng, items: readonly T[]): T =>
	items[Math.floor(rng() * items.length) % items.length];
const clamp = (v: number, min: number, max: number) =>
	Math.min(max, Math.max(min, v));

const PATCH_ZONES = [
	{ x: 760, y: 60, w: 240, h: 170 },
	{ x: -40, y: 350, w: 190, h: 210 },
	{ x: 780, y: 430, w: 230, h: 270 },
	{ x: -30, y: 700, w: 190, h: 260 },
	{ x: 800, y: 850, w: 230, h: 200 },
	{ x: -20, y: 1140, w: 170, h: 210 },
];

const baseLabels: readonly Label[] = [
	{
		text: "HUMANS FIRST",
		x: 196,
		y: 372,
		anchor: "start",
		line: { x1: 196, y1: 386, x2: 118, y2: 386 },
	},
	{
		text: "SHIPPED. OFFLINE",
		x: 34,
		y: 452,
		anchor: "start",
		line: { x1: 118, y1: 440, x2: 240, y2: 498 },
	},
	{
		text: "WE MADE THIS",
		x: 330,
		y: 300,
		anchor: "start",
		line: { x1: 420, y1: 306, x2: 506, y2: 404 },
		arrow: true,
	},
	{
		text: "TOOLS.",
		x: 392,
		y: 332,
		anchor: "start",
		line: { x1: 448, y1: 338, x2: 540, y2: 424 },
		arrow: true,
	},
	{
		text: "SF IS LONELY",
		x: 902,
		y: 612,
		anchor: "end",
		line: { x1: 898, y1: 620, x2: 820, y2: 662 },
		arrow: true,
	},
	{ text: "SYNC", x: 152, y: 1000, anchor: "start" },
	{ text: "CURL", x: 256, y: 1392, anchor: "start" },
	{ text: "ASK AROUND", x: 585, y: 1322, anchor: "middle" },
	{ text: "SYSTEM", x: 892, y: 1140, anchor: "start" },
];

export function createPaperPoster(options: PaperPosterOptions): PosterLayout {
	const rng = createRng(options.seed);
	const figureCount = clamp(Math.round(options.figureCount), 5, 16);

	// --- Figures ------------------------------------------------------------
	const radius = range(rng, 302, 314);
	const delta = (Math.PI * 2) / figureCount;
	const spacing = 2 * radius * Math.sin(delta / 2);
	const height = clamp(spacing * 1.12, 160, 270);

	const blueIndex = Math.floor(rng() * figureCount);

	const figures: Figure[] = Array.from({ length: figureCount }, (_, i) => {
		const phi = -90 + (360 / figureCount) * i;
		const rad = (phi * Math.PI) / 180;
		const figHeight = height + range(rng, -12, 12);
		// Hands reach a little past the chord midpoint and sit near shoulder
		// height, so neighbouring arms merge into a lumpy chain like the
		// reference (the irregularity is what sells the paper collage look).
		const handX = (spacing / 2) * range(rng, 1.1, 1.35);
		const handY = -figHeight * range(rng, 0.16, 0.24);
		return {
			x: POSTER.cx + radius * Math.cos(rad) + range(rng, -9, 9),
			y: POSTER.cy + radius * Math.sin(rad) + range(rng, -9, 9),
			angle: phi + 90 + range(rng, -7, 7),
			height: figHeight,
			handX,
			handY,
			color: i === blueIndex ? PAPER_PALETTE.blue : PAPER_PALETTE.orange,
		};
	});

	// --- Pixel patches ------------------------------------------------------
	const patchColors = [
		PAPER_PALETTE.pink,
		PAPER_PALETTE.periwinkle,
		PAPER_PALETTE.yellow,
		PAPER_PALETTE.cream,
	];

	const patches: Patch[] = PATCH_ZONES.map((zone) => {
		const cell = Math.round(range(rng, 30, 42));
		const cols = Math.round(range(rng, 4, 8));
		const rows = Math.round(range(rng, 3, 6));
		const base = pick(rng, [PAPER_PALETTE.pink, PAPER_PALETTE.periwinkle]);
		let accent = pick(rng, patchColors);
		if (accent === base) accent = PAPER_PALETTE.yellow;

		const cells = Array.from({ length: cols * rows }, () => {
			// Low-frequency blocks so the pattern reads as pixels, not noise.
			const block = rng() < 0.45 ? 1 : 0;
			return rng() < 0.7 ? block : 1 - block;
		});

		// Knock a chunk out of the grid so patches read as L-shaped scraps.
		if (rng() < 0.75) {
			const hw = Math.max(1, Math.round(cols * range(rng, 0.3, 0.6)));
			const hh = Math.max(1, Math.round(rows * range(rng, 0.3, 0.6)));
			const atLeft = rng() < 0.5;
			const atTop = rng() < 0.5;
			for (let row = 0; row < hh; row++) {
				for (let col = 0; col < hw; col++) {
					const c = atLeft ? col : cols - 1 - col;
					const r = atTop ? row : rows - 1 - row;
					cells[r * cols + c] = -1;
				}
			}
		}

		const patch: Patch = {
			x: zone.x + range(rng, 0, zone.w * 0.18),
			y: zone.y + range(rng, 0, zone.h * 0.18),
			cell,
			cols,
			rows,
			base,
			accent,
			cells,
		};

		if (rng() < 0.45) {
			patch.clover = {
				cx: patch.x + cell * range(rng, 1, cols - 1),
				cy: patch.y + cell * range(rng, 1, rows - 1),
				r: cell * 0.22,
				color:
					base === PAPER_PALETTE.pink
						? PAPER_PALETTE.periwinkle
						: PAPER_PALETTE.yellow,
			};
		}

		return patch;
	});

	// --- Labels -------------------------------------------------------------
	const labels: Label[] = baseLabels.map((label) => {
		const jx = range(rng, -8, 8);
		const jy = range(rng, -8, 8);
		return {
			...label,
			x: Math.round(label.x + jx),
			y: Math.round(label.y + jy),
			line: label.line
				? {
						x1: label.line.x1 + jx,
						y1: label.line.y1 + jy,
						x2: label.line.x2 + jx,
						y2: label.line.y2 + jy,
					}
				: undefined,
		};
	});

	return { figures, patches, labels };
}

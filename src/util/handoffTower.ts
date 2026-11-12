/**
 * Procedural "handoff tower" poster generator.
 *
 * Recreates the look of Bakers Studio's Collab posters: a pixel-mosaic tower
 * cut from magenta / lime / emerald squares, with royal-blue pipes that fork
 * from caps at the top down to a row of bowtie connectors. Hatch patches,
 * clover marks and tiny mono annotations sit on top of the collage.
 *
 * Everything is laid out on a 22 x 33 cell grid so the mosaic stays legible at
 * poster size, while pipes, clovers and labels float on absolute units.
 */

export const TOWER_POSTER = { width: 1080, height: 1528 } as const;

export const TOWER_PALETTE = {
	paper: "#f3ebd8",
	/** Slightly brighter paper for annotation chips. */
	chip: "#f8f3e6",
	pink: "#f48de8",
	lime: "#daff45",
	green: "#1fd077",
	blue: "#283adc",
	ink: "#0b0805",
} as const;

export type TowerInk = "pink" | "lime" | "green";

const CELL = 42;
const COLS = 22;
const ROWS = 33;
const GRID_X = (TOWER_POSTER.width - COLS * CELL) / 2;
const GRID_Y = 40;

/** Horizontal span (in cells) of the mosaic for every row. */
const PROFILE: readonly (readonly (readonly [number, number])[])[] = [
	[
		[7, 8],
		[15, 16],
	],
	[
		[7, 8],
		[15, 16],
	],
	[
		[6, 10],
		[12, 16],
	],
	[
		[6, 10],
		[12, 16],
	],
	[[6, 16]],
	[[6, 16]],
	[[6, 16]],
	[[6, 16]],
	[[5, 17]],
	[[5, 17]],
	[[5, 17]],
	[[5, 17]],
	[[5, 18]],
	[[4, 18]],
	[[4, 18]],
	[[3, 19]],
	[[3, 20]],
	[[1, 21]],
	[[1, 21]],
	[[3, 19]],
	[[3, 19]],
	[[1, 21]],
	[[1, 21]],
	[[1, 21]],
	[[1, 21]],
	[[1, 21]],
	[[0, 22]],
	[[0, 22]],
	[[1, 21]],
	[
		[1, 10],
		[13, 21],
	],
	[
		[0, 2],
		[4, 8],
		[15, 18],
		[20, 22],
	],
	[
		[0, 3],
		[20, 22],
	],
	[
		[0, 2],
		[21, 22],
	],
];

const COLOR_OF: Record<TowerInk, string> = {
	pink: TOWER_PALETTE.pink,
	lime: TOWER_PALETTE.lime,
	green: TOWER_PALETTE.green,
};

type Band = {
	from: number;
	to: number;
	weights: Record<TowerInk, number>;
};

/** Per-row colour bias: where the tower is pink, where it turns emerald. */
const BANDS: readonly Band[] = [
	{ from: 0, to: 4, weights: { pink: 2, lime: 3, green: 3 } },
	{ from: 4, to: 8, weights: { pink: 4, lime: 3, green: 2 } },
	{ from: 8, to: 12, weights: { pink: 5, lime: 3, green: 1 } },
	{ from: 12, to: 15, weights: { pink: 3, lime: 2, green: 4 } },
	{ from: 15, to: 19, weights: { pink: 4, lime: 3, green: 2 } },
	{ from: 19, to: 21, weights: { pink: 5, lime: 2, green: 2 } },
	{ from: 21, to: 26, weights: { pink: 4, lime: 3, green: 2 } },
	{ from: 26, to: 33, weights: { pink: 4, lime: 3, green: 3 } },
];

export type TextureKind = "grid" | "hatch" | "dots" | "lines";

export type MosaicCell = { x: number; y: number; color: string };

export type Texture = {
	x: number;
	y: number;
	w: number;
	h: number;
	kind: TextureKind;
	color: string;
};

export type Clover = { x: number; y: number; size: number; color: string };

export type Point = { x: number; y: number };

export type Pipe = { points: readonly Point[]; width: number };

export type Bowtie = {
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
};

export type LeaderLine = { points: readonly Point[] };

export type Annotation = {
	text: string;
	x: number;
	y: number;
	anchor: "start" | "middle" | "end";
	leader?: LeaderLine;
};

export type Cluster = {
	x: number;
	y: number;
	cols: number;
	rows: number;
	color: string;
};

export type Thread = {
	x: number;
	y1: number;
	y2: number;
	dashed: boolean;
	dots: readonly { y: number; color: string }[];
};

/** Handoff column size, in cells, so the renderer can size connectors. */
export type HandoffLayout = {
	cell: number;
	cells: MosaicCell[];
	textures: Texture[];
	clovers: Clover[];
	pipes: Pipe[];
	bowties: Bowtie[];
	caps: Clover[];
	annotations: Annotation[];
	clusters: Cluster[];
	leaders: LeaderLine[];
	threads: Thread[];
};

export type HandoffOptions = {
	seed: number;
	/** Number of handoff columns in the lower band. */
	towers: number;
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
const clamp = (v: number, min: number, max: number) =>
	Math.min(max, Math.max(min, v));
const px = (col: number) => GRID_X + col * CELL;
const py = (row: number) => GRID_Y + row * CELL;

function weightedPick(rng: Rng, weights: Record<TowerInk, number>): TowerInk {
	const keys = ["pink", "lime", "green"] as const;
	const total = weights.pink + weights.lime + weights.green || 1;
	let roll = rng() * total;
	for (const key of keys) {
		roll -= weights[key];
		if (roll <= 0) return key;
	}
	return "green";
}

function weightsFor(row: number): Record<TowerInk, number> {
	for (const band of BANDS) {
		if (row >= band.from && row < band.to) return band.weights;
	}
	return BANDS[BANDS.length - 1].weights;
}

const spans = (row: number) => PROFILE[row] ?? [];

function inside(col: number, row: number) {
	return spans(row).some(([l, r]) => col >= l && col < r);
}

type Rect = { col: number; row: number; cols: number; rows: number };

/** Random rectangle that sits fully inside the mosaic silhouette. */
function pickRect(
	rng: Rng,
	colRange: readonly [number, number],
	rowRange: readonly [number, number],
	size: { cols: readonly [number, number]; rows: readonly [number, number] },
): Rect | null {
	for (let attempt = 0; attempt < 40; attempt++) {
		const cols = Math.round(range(rng, size.cols[0], size.cols[1]));
		const rows = Math.round(range(rng, size.rows[0], size.rows[1]));
		const col = Math.round(range(rng, colRange[0], colRange[1] - cols));
		const row = Math.round(range(rng, rowRange[0], rowRange[1] - rows));
		let ok = true;
		for (let r = row; r < row + rows && ok; r++) {
			for (let c = col; c < col + cols && ok; c++) {
				if (!inside(c, r)) ok = false;
			}
		}
		if (ok) return { col, row, cols, rows };
	}
	return null;
}

/** Picks the colour that contrasts strongest with the mosaic underneath. */
function contrastInk(rng: Rng, base: TowerInk): TowerInk {
	if (base === "pink") return rng() < 0.5 ? "green" : "lime";
	if (base === "lime") return rng() < 0.6 ? "pink" : "green";
	return rng() < 0.5 ? "pink" : "lime";
}

export function createHandoffTower(options: HandoffOptions): HandoffLayout {
	const rng = createRng(options.seed);
	const towers = clamp(Math.round(options.towers), 4, 8);

	// --- Mosaic -------------------------------------------------------------
	const grid: (TowerInk | null)[][] = Array.from({ length: ROWS }, () =>
		Array<TowerInk | null>(COLS).fill(null),
	);

	for (let row = 0; row < ROWS; row++) {
		const weights = weightsFor(row);
		// One dominant ink per row keeps the mosaic reading as paper bands.
		const rowInk = weightedPick(rng, weights);
		for (const [l, r] of spans(row)) {
			let col = l;
			while (col < r) {
				const above = row > 0 ? grid[row - 1][col] : null;
				const roll = rng();
				const color =
					roll < 0.46
						? rowInk
						: above && roll < 0.74
							? above
							: weightedPick(rng, weights);
				const end = Math.min(r, col + 2 + Math.floor(rng() * 5));
				for (let c = col; c < end; c++) grid[row][c] = color;
				col = end;
			}
		}
	}

	const paint = (rect: Rect, color: TowerInk) => {
		for (let r = rect.row; r < rect.row + rect.rows; r++) {
			for (let c = rect.col; c < rect.col + rect.cols; c++) {
				if (inside(c, r)) grid[r][c] = color;
			}
		}
	};

	const inkAt = (col: number, row: number): TowerInk => {
		const r = clamp(Math.round(row), 0, ROWS - 1);
		const c = clamp(Math.round(col), 0, COLS - 1);
		return grid[r][c] ?? "pink";
	};

	// Broad single-colour fields: large quiet areas to balance the checkers.
	for (let i = 0; i < 6; i++) {
		const rect = pickRect(rng, [0, COLS - 4], [5, ROWS - 4], {
			cols: [4, 8],
			rows: [1, 3],
		});
		if (!rect) continue;
		paint(rect, rng() < 0.55 ? "lime" : "pink");
	}

	// Checkerboard scraps: the loudest motif in the reference.
	for (let i = 0; i < 5; i++) {
		const rect = pickRect(rng, [0, COLS - 2], [4, ROWS - 3], {
			cols: [2, 4],
			rows: [2, 3],
		});
		if (!rect) continue;
		const pair: [TowerInk, TowerInk] =
			rng() < 0.5 ? ["pink", "green"] : ["lime", "pink"];
		for (let r = 0; r < rect.rows; r++) {
			for (let c = 0; c < rect.cols; c++) {
				if (inside(rect.col + c, rect.row + r)) {
					grid[rect.row + r][rect.col + c] =
						(r + c) % 2 === 0 ? pair[0] : pair[1];
				}
			}
		}
	}

	// Horizontal stripe scraps.
	for (let i = 0; i < 5; i++) {
		const rect = pickRect(rng, [0, COLS - 3], [6, ROWS - 4], {
			cols: [3, 6],
			rows: [3, 5],
		});
		if (!rect) continue;
		const base = inkAt(rect.col, rect.row);
		const stripe = rng() < 0.5 ? "pink" : "lime";
		for (let r = 0; r < rect.rows; r++) {
			const color =
				r % 2 === 0 ? base : stripe === base ? contrastInk(rng, base) : stripe;
			for (let c = 0; c < rect.cols; c++) {
				if (inside(rect.col + c, rect.row + r)) {
					grid[rect.row + r][rect.col + c] = color;
				}
			}
		}
	}

	// Alternating columns: vertical bars, like the reference's lime ladders.
	for (let i = 0; i < 3; i++) {
		const rect = pickRect(rng, [0, COLS - 2], [7, ROWS - 4], {
			cols: [2, 4],
			rows: [2, 4],
		});
		if (!rect) continue;
		const pair: [TowerInk, TowerInk] =
			rng() < 0.5 ? ["lime", "pink"] : ["green", "pink"];
		for (let r = 0; r < rect.rows; r++) {
			for (let c = 0; c < rect.cols; c++) {
				if (inside(rect.col + c, rect.row + r)) {
					grid[rect.row + r][rect.col + c] = pair[c % 2];
				}
			}
		}
	}

	// Solid cut squares for punch.
	for (let i = 0; i < 9; i++) {
		const rect = pickRect(rng, [0, COLS - 1], [3, ROWS - 2], {
			cols: [1, 2],
			rows: [1, 2],
		});
		if (!rect) continue;
		paint(rect, rng() < 0.55 ? "lime" : "green");
	}

	// Ladder strips: single accent columns, like the reference's green bars.
	for (let i = 0; i < 4; i++) {
		const rect = pickRect(rng, [0, COLS - 1], [14, ROWS - 4], {
			cols: [1, 1],
			rows: [2, 4],
		});
		if (!rect) continue;
		paint(rect, rng() < 0.5 ? "green" : "lime");
	}

	// A green-and-pink checker under the weave so the chest band reads emerald.
	for (let row = 12; row < 14; row++) {
		for (let col = 5; col < 18; col++) {
			if (!inside(col, row)) continue;
			const greenCell = (row * 7 + col * 3) % 4 !== 0;
			grid[row][col] = greenCell ? "green" : "pink";
		}
	}

	const cells: MosaicCell[] = [];
	for (let row = 0; row < ROWS; row++) {
		for (let col = 0; col < COLS; col++) {
			const ink = grid[row][col];
			if (!ink) continue;
			cells.push({ x: px(col), y: py(row), color: COLOR_OF[ink] });
		}
	}

	// --- Textures -----------------------------------------------------------
	const textures: Texture[] = [
		// Dense emerald weave across the chest.
		{
			x: px(5),
			y: py(12),
			w: CELL * 13,
			h: CELL * 2,
			kind: "grid",
			color: TOWER_PALETTE.green,
		},
		// Lime graph paper over both shoulders.
		{
			x: px(7),
			y: py(8),
			w: CELL * 3,
			h: CELL * 2,
			kind: "hatch",
			color: TOWER_PALETTE.lime,
		},
		{
			x: px(13),
			y: py(8),
			w: CELL * 3,
			h: CELL * 2,
			kind: "hatch",
			color: TOWER_PALETTE.lime,
		},
	];

	const kinds: readonly TextureKind[] = ["grid", "hatch", "dots", "lines"];
	for (let i = 0; i < 6; i++) {
		const rect = pickRect(rng, [0, COLS - 3], [14, ROWS - 3], {
			cols: [2, 4],
			rows: [1, 3],
		});
		if (!rect) continue;
		const kind = kinds[i % kinds.length];
		textures.push({
			x: px(rect.col),
			y: py(rect.row),
			w: CELL * rect.cols,
			h: CELL * rect.rows,
			kind,
			color:
				kind === "dots"
					? rng() < 0.6
						? TOWER_PALETTE.lime
						: TOWER_PALETTE.green
					: rng() < 0.5
						? TOWER_PALETTE.green
						: TOWER_PALETTE.lime,
		});
	}

	// --- Clovers ------------------------------------------------------------
	const clovers: Clover[] = [
		// Two oversized marks meeting the handoff label.
		{ x: 468, y: 462, size: 150, color: TOWER_PALETTE.green },
		{ x: 768, y: 462, size: 150, color: TOWER_PALETTE.green },
		// The small pair under the chest band.
		{ x: 505, y: 792, size: 46, color: TOWER_PALETTE.green },
		{ x: 577, y: 792, size: 46, color: TOWER_PALETTE.green },
		// Marks stamped into the feet at the base.
		{ x: 152, y: 1362, size: 54, color: TOWER_PALETTE.green },
		{ x: 936, y: 1372, size: 54, color: TOWER_PALETTE.green },
	];
	for (let i = 0; i < 13; i++) {
		const col = range(rng, 1, COLS - 1);
		const row = range(rng, 3.2, ROWS - 4);
		if (!inside(Math.round(col), Math.round(row))) continue;
		clovers.push({
			x: px(col),
			y: py(row),
			size: range(rng, 38, 62),
			color: COLOR_OF[contrastInk(rng, inkAt(col, row))],
		});
	}

	// --- Pipes --------------------------------------------------------------
	const cx = TOWER_POSTER.width / 2;
	const spacing = 720 / (towers - 1);
	const towerXs = Array.from(
		{ length: towers },
		(_, i) => cx + (i - (towers - 1) / 2) * spacing,
	);

	const CAP_Y = 108;
	const CAP_X = 232;
	const STEM_END = 470;
	const LEAF_END = 890;
	const HANDOFF_Y = 924;
	const BAND_TOP = 962;
	const FORK_Y = 1150;
	const LEG_END = 1278;
	const BASE_Y = 1300;
	const pipeWidth = 21;
	const splay = spacing * 0.26;

	// Balanced binary tree over the handoff columns: each node splits its
	// columns in half, so a fork never reaches across the poster.
	type Node = { x: number; children: Node[] };
	const split = (xs: readonly number[]): Node => {
		if (xs.length === 1) return { x: xs[0], children: [] };
		const mid = Math.ceil(xs.length / 2);
		const left = split(xs.slice(0, mid));
		const right = split(xs.slice(mid));
		return { x: (left.x + right.x) / 2, children: [left, right] };
	};
	const half = Math.ceil(towerXs.length / 2);
	const roots = [split(towerXs.slice(0, half)), split(towerXs.slice(half))];
	// The caps sit on the paper either side of the top peaks, not over them.
	roots[0].x = cx - CAP_X;
	roots[1].x = cx + CAP_X;

	const depthOf = (node: Node): number =>
		node.children.length === 0
			? 0
			: 1 + Math.max(...node.children.map(depthOf));
	const levels = Math.max(...roots.map(depthOf));

	const pipes: Pipe[] = [];
	const caps: Clover[] = [];
	const bowties: Bowtie[] = [];

	/** Elbow pipe: straight down, 45 degree jog, straight down again. */
	const elbow = (from: Point, toX: number, endY: number): Pipe => {
		const elbowY = from.y + Math.abs(toX - from.x);
		const points: Point[] = [from];
		if (elbowY < endY - 1) {
			points.push({ x: toX, y: elbowY }, { x: toX, y: endY });
		} else {
			points.push({ x: toX, y: endY });
		}
		return { points, width: pipeWidth };
	};

	/** Height of the fork that feeds the level below `depth`. */
	const nextFork = (depth: number) =>
		STEM_END +
		(LEAF_END - STEM_END) * Math.min(1, ((depth + 1) / levels) ** 0.55);

	const grow = (node: Node, fromY: number, depth: number) => {
		if (node.children.length === 0) {
			// A column that forks early still drops to the handoff row.
			if (LEAF_END - fromY > 1) {
				pipes.push({
					points: [
						{ x: node.x, y: fromY },
						{ x: node.x, y: LEAF_END },
					],
					width: pipeWidth,
				});
			}
			return;
		}
		const forkY = nextFork(depth);
		for (const child of node.children) {
			pipes.push(elbow({ x: node.x, y: fromY }, child.x, forkY));
			grow(child, forkY, depth + 1);
		}
	};

	for (const root of roots) {
		caps.push({ x: root.x, y: CAP_Y, size: 58, color: TOWER_PALETTE.blue });
		// The cap's stem runs straight down before the first fork.
		pipes.push({
			points: [
				{ x: root.x, y: CAP_Y + 24 },
				{ x: root.x, y: STEM_END },
			],
			width: pipeWidth,
		});
		grow(root, STEM_END, 0);
	}

	for (const x of towerXs) {
		bowties.push({
			x,
			y: HANDOFF_Y,
			width: 66,
			height: 30,
			color: TOWER_PALETTE.blue,
		});

		pipes.push({
			points: [
				{ x, y: BAND_TOP },
				{ x, y: FORK_Y },
				{ x: x - splay, y: FORK_Y + splay },
				{ x: x - splay, y: LEG_END },
			],
			width: pipeWidth,
		});
		pipes.push({
			points: [
				{ x, y: FORK_Y },
				{ x: x + splay, y: FORK_Y + splay },
				{ x: x + splay, y: LEG_END },
			],
			width: pipeWidth,
		});

		const baseWidth = Math.max(32, spacing * 0.36);
		for (const legX of [x - splay, x + splay]) {
			bowties.push({
				x: legX,
				y: BASE_Y,
				width: baseWidth,
				height: baseWidth * 0.46,
				color: TOWER_PALETTE.ink,
			});
		}
	}

	// Black connectors flanking the big clovers.
	bowties.push(
		{ x: 176, y: 520, width: 64, height: 29, color: TOWER_PALETTE.ink },
		{ x: 618, y: 520, width: 64, height: 29, color: TOWER_PALETTE.ink },
		{ x: 896, y: 520, width: 64, height: 29, color: TOWER_PALETTE.ink },
	);

	// --- Annotations --------------------------------------------------------
	const annotations: Annotation[] = [
		{
			text: "handoff",
			x: 704,
			y: 498,
			anchor: "start",
			leader: {
				points: [
					{ x: 700, y: 489 },
					{ x: 676, y: 472 },
					{ x: 660, y: 454 },
				],
			},
		},
		{
			text: "re: re:",
			x: 468,
			y: 868,
			anchor: "start",
			leader: {
				points: [
					{ x: 522, y: 874 },
					{ x: 522, y: 896 },
					{ x: 500, y: 916 },
				],
			},
		},
		{
			text: "<-reply",
			x: 878,
			y: 864,
			anchor: "start",
			leader: {
				points: [
					{ x: 920, y: 872 },
					{ x: 920, y: 902 },
					{ x: 898, y: 924 },
				],
			},
		},
	];

	const clusters: Cluster[] = [];
	const clusterSpecs = [
		{ x: 250, y: 262, cols: 3, rows: 2 },
		{ x: 878, y: 258, cols: 3, rows: 2 },
		{ x: 196, y: 690, cols: 2, rows: 2 },
		{ x: 424, y: 694, cols: 2, rows: 2 },
		{ x: 754, y: 690, cols: 2, rows: 2 },
		{ x: 954, y: 700, cols: 2, rows: 2 },
	];
	for (const spec of clusterSpecs) {
		clusters.push({
			x: spec.x + range(rng, -6, 6),
			y: spec.y + range(rng, -6, 6),
			cols: spec.cols,
			rows: spec.rows,
			color: TOWER_PALETTE.ink,
		});
	}

	// Thin right-angle leaders from the shoulder clusters up to the caps.
	const leaders: LeaderLine[] = [
		{
			points: [
				{ x: 246, y: 250 },
				{ x: 230, y: 214 },
				{ x: 230, y: 182 },
			],
		},
		{
			points: [
				{ x: 890, y: 246 },
				{ x: 874, y: 206 },
				{ x: 874, y: 164 },
			],
		},
	];

	const threads: Thread[] = [];
	const threadX = [306, 420, 540, 640, 700, 792, 890];
	for (let i = 0; i < threadX.length; i++) {
		const dots: { y: number; color: string }[] = [];
		const dotCount = Math.floor(range(rng, 0, 3.2));
		for (let d = 0; d < dotCount; d++) {
			dots.push({
				y: range(rng, 1370, 1510),
				color: rng() < 0.7 ? TOWER_PALETTE.ink : TOWER_PALETTE.blue,
			});
		}
		threads.push({
			x: threadX[i] + range(rng, -14, 14),
			y1: range(rng, 1336, 1354),
			y2: TOWER_POSTER.height,
			dashed: rng() < 0.3,
			dots: dots.sort((a, b) => a.y - b.y),
		});
	}

	return {
		cell: CELL,
		cells,
		textures,
		clovers,
		pipes,
		bowties,
		caps,
		annotations,
		clusters,
		leaders,
		threads,
	};
}

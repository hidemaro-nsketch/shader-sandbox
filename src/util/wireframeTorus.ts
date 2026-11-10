/**
 * Procedural CAD-style wireframe torus.
 *
 * Recreates an engineering-drawing render: a transparent wireframe wheel
 * housing on a grid floor, with CAD dimension lines (mm) and a glowing
 * highlighted part.
 */

export type Vec3 = [number, number, number];
export type Point2 = [number, number];

export const CAD_POSTER = { width: 1600, height: 900 } as const;

export const CAD_PALETTE = {
	bg: "#151513",
	wire: "#e9e9e4",
	grid: "#8d8d86",
	accent: "#d7e94f",
} as const;

/** Ring dimensions in millimetres (matches the drawing's 720 / 405 labels). */
export const TORUS = {
	outerDiameter: 720,
	depth: 405,
	/** Rim dimensions: outer diameter 720mm, hole 288mm. */
	majorRadius: 252,
	minorRadius: 108,
	holeRadius: 144,
} as const;

// --- Vector helpers --------------------------------------------------------

const rotY = ([x, y, z]: Vec3, a: number): Vec3 => [
	x * Math.cos(a) + z * Math.sin(a),
	y,
	-x * Math.sin(a) + z * Math.cos(a),
];

const rotX = ([x, y, z]: Vec3, a: number): Vec3 => [
	x,
	y * Math.cos(a) - z * Math.sin(a),
	y * Math.sin(a) + z * Math.cos(a),
];

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
	a[1] * b[2] - a[2] * b[1],
	a[2] * b[0] - a[0] * b[2],
	a[0] * b[1] - a[1] * b[0],
];
const norm = (a: Vec3): Vec3 => {
	const l = Math.hypot(a[0], a[1], a[2]) || 1;
	return [a[0] / l, a[1] / l, a[2] / l];
};

export type Camera = {
	eye: Vec3;
	target: Vec3;
	focal: number;
};

export function makeCamera(azimuth: number, elevation: number): Camera {
	const distance = 2100;
	const az = (azimuth * Math.PI) / 180;
	const el = (elevation * Math.PI) / 180;
	return {
		eye: [
			distance * Math.cos(el) * Math.sin(az),
			distance * Math.sin(el),
			distance * Math.cos(el) * Math.cos(az),
		],
		target: [0, 0, 0],
		focal: 2.35,
	};
}

/** Perspective projection into normalised screen coordinates. */
export function makeProjector(camera: Camera) {
	const forward = norm(sub(camera.target, camera.eye));
	const right = norm(cross(forward, [0, 1, 0]));
	const up = cross(right, forward);
	return (p: Vec3): Point2 => {
		const d = sub(p, camera.eye);
		const zc = dot(d, forward);
		const s = camera.focal / Math.max(zc, 1);
		return [dot(d, right) * s, -dot(d, up) * s];
	};
}

/** Fit raw projected coordinates into a rect, preserving aspect. */
export function makeFit(
	points: Point2[],
	rect: { x: number; y: number; w: number; h: number },
	cover = false,
) {
	const xs = points.map((p) => p[0]);
	const ys = points.map((p) => p[1]);
	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);
	const scale = cover
		? Math.max(rect.w / (maxX - minX), rect.h / (maxY - minY))
		: Math.min(rect.w / (maxX - minX), rect.h / (maxY - minY));
	const cx = (minX + maxX) / 2;
	const cy = (minY + maxY) / 2;
	return (p: Point2): Point2 => [
		rect.x + rect.w / 2 + (p[0] - cx) * scale,
		rect.y + rect.h / 2 + (p[1] - cy) * scale,
	];
}

// --- Geometry --------------------------------------------------------------

export type Wire = readonly Vec3[];

/**
 * Torus polylines with its axis along X: `segments` rings around the tube and
 * `sides` meridians. `radius` is the tube radius.
 */
export function torusPolylines(
	radius: number,
	segments: number,
	sides: number,
	major: number = TORUS.majorRadius,
): Wire[] {
	const lines: Wire[] = [];
	// Rings around the tube (one per meridian step).
	for (let i = 0; i < segments; i++) {
		const u = (i / segments) * Math.PI * 2;
		const ring: Vec3[] = [];
		for (let j = 0; j <= sides; j++) {
			const v = (j / sides) * Math.PI * 2;
			const rr = major + radius * Math.cos(v);
			ring.push([radius * Math.sin(v), rr * Math.cos(u), rr * Math.sin(u)]);
		}
		lines.push(ring);
	}
	// Meridians (circles around the wheel axis).
	for (let j = 0; j < sides; j++) {
		const v = (j / sides) * Math.PI * 2;
		const meridian: Vec3[] = [];
		for (let i = 0; i <= segments; i++) {
			const u = (i / segments) * Math.PI * 2;
			const rr = major + radius * Math.cos(v);
			meridian.push([radius * Math.sin(v), rr * Math.cos(u), rr * Math.sin(u)]);
		}
		lines.push(meridian);
	}
	return lines;
}

/** Ring (circle) in the YZ plane at a given X offset. */
export function axialRing(radius: number, x: number, steps = 64): Wire {
	const ring: Vec3[] = [];
	for (let i = 0; i <= steps; i++) {
		const a = (i / steps) * Math.PI * 2;
		ring.push([x, radius * Math.cos(a), radius * Math.sin(a)]);
	}
	return ring;
}

/** Cylinder side lines (hole wall). */
export function cylinderPolylines(
	radius: number,
	fromX: number,
	toX: number,
	steps = 24,
): Wire[] {
	const lines: Wire[] = [];
	for (let i = 0; i < steps; i++) {
		const a = (i / steps) * Math.PI * 2;
		const y = radius * Math.cos(a);
		const z = radius * Math.sin(a);
		lines.push([
			[fromX, y, z],
			[toX, y, z],
		]);
	}
	return lines;
}

/** Grid lines on the floor plane (y = floorY), centred on the object. */
export function floorGrid(half: number, step: number, floorY: number): Wire[] {
	const lines: Wire[] = [];
	for (let v = -half; v <= half + 0.01; v += step) {
		lines.push([
			[v, floorY, -half],
			[v, floorY, half],
		]);
		lines.push([
			[-half, floorY, v],
			[half, floorY, v],
		]);
	}
	return lines;
}

export function applyCamera(p: Vec3, azimuth: number, elevation: number): Vec3 {
	return rotX(rotY(p, (azimuth * Math.PI) / 180), (elevation * Math.PI) / 180);
}

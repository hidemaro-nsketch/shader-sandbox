import type { Color } from "three";
import {
	abs,
	cos,
	dot,
	equal,
	Fn,
	floor,
	fract,
	length,
	max,
	min,
	mix,
	oneMinus,
	type ShaderNodeObject,
	select,
	sin,
	step,
	type Texture,
	texture,
	type UniformNode,
	uv,
	vec2,
	vec3,
	vec4,
} from "three/tsl";

/**
 * Halftone uniforms. Each field is a TSL uniform whose `.value` is mutated
 * in-place by the React layer, so the shader updates live without rebuilds.
 */
export interface HalftoneUniforms {
	tex: ShaderNodeObject<Texture>;
	cells: ShaderNodeObject<UniformNode<number>>;
	dotScale: ShaderNodeObject<UniformNode<number>>;
	angle: ShaderNodeObject<UniformNode<number>>;
	contrast: ShaderNodeObject<UniformNode<number>>;
	brightness: ShaderNodeObject<UniformNode<number>>;
	invert: ShaderNodeObject<UniformNode<number>>;
	shape: ShaderNodeObject<UniformNode<number>>;
	colorMode: ShaderNodeObject<UniformNode<number>>;
	tint: ShaderNodeObject<UniformNode<Color>>;
	bgColor: ShaderNodeObject<UniformNode<Color>>;
}

/** Shape index → name mapping (shared SSoT for GUI + page). */
export const HALFTONE_SHAPES = [
	"circle",
	"square",
	"diamond",
	"hexagon",
	"cross",
	"line",
	"ring",
	"triangle",
] as const;

export type HalftoneShape = (typeof HALFTONE_SHAPES)[number];

const LUM_COEF = vec3(0.299, 0.587, 0.114);

/**
 * Distance-from-center "SDF" for each shape, parameterized by the fragment
 * position inside its cell (p = fc - 0.5, so p ∈ [-0.5, 0.5]).
 *
 * All shapes return 0 at the cell center and grow outward, so
 * `step(d, radius)` shrinks/enlarges the shape consistently with the
 * existing circle/square behavior.
 *
 * Shapes:
 *  0 circle   — length(p)
 *  1 square   — max(|p.x|, |p.y|)
 *  2 diamond  — |p.x| + |p.y|
 *  3 hexagon  — hexagonal norm (3 strips at 0°/±60°)
 *  4 cross    — min(|p.x|, |p.y|) (plus sign, arm thickness scales)
 *  5 line     — |p.y| (horizontal bar, height scales)
 *  6 ring     — |length(p) - 0.3| (annulus, thickness scales)
 *  7 triangle — max of 3 edge forms, normalized to 0.5 at the edges
 */
function shapeDistance(
	p: ShaderNodeObject<UniformNode<number>>,
	shape: number,
) {
	const px = p.x.toVar();
	const py = p.y.toVar();

	const dCircle = length(p);
	const dSquare = max(abs(px), abs(py));
	const dDiamond = abs(px).add(abs(py));
	const dHexagon = max(
		max(abs(py), abs(px.mul(0.5).add(py.mul(0.866)))),
		abs(px.mul(0.5).sub(py.mul(0.866))),
	);
	const dCross = min(abs(px), abs(py));
	const dLine = abs(py);
	const dRing = abs(dCircle.sub(0.3));
	// Pointing-up triangle: 3 outward-normal linear forms, edge at apothem.
	// Normalize so the edge sits at 0.5 (consistent with other shapes).
	const dTri = max(
		max(py, px.mul(-0.866).sub(py.mul(0.5))),
		px.mul(0.866).sub(py.mul(0.5)),
	)
		.div(0.43)
		.mul(0.5);

	// Select by shape index via nested ternaries.
	return select(
		equal(shape, 0),
		dCircle,
		select(
			equal(shape, 1),
			dSquare,
			select(
				equal(shape, 2),
				dDiamond,
				select(
					equal(shape, 3),
					dHexagon,
					select(
						equal(shape, 4),
						dCross,
						select(
							equal(shape, 5),
							dLine,
							select(equal(shape, 6), dRing, dTri),
						),
					),
				),
			),
		),
	);
}

/**
 * Build a halftone TSL color node (vec4) from the given uniforms.
 * Flow: rotate UV → grid quantize → sample texture at cell center →
 * luminance → dot radius → draw dot (selected shape) → colorize.
 */
export function buildHalftoneColorNode(u: HalftoneUniforms) {
	return Fn(() => {
		const theta = u.angle;

		// Rotate UV around center so the whole grid tilts.
		const centered = uv().sub(0.5).toVar();
		const rot = vec2(
			centered.x.mul(cos(theta)).sub(centered.y.mul(sin(theta))),
			centered.x.mul(sin(theta)).add(centered.y.mul(cos(theta))),
		)
			.add(0.5)
			.toVar();

		// Quantize to grid cells.
		const cell = rot.mul(u.cells).toVar();
		const cellId = floor(cell).toVar();
		const cellCenterUv = cellId.add(0.5).div(u.cells).toVar();

		// Sample photo at cell center → smooth halftone.
		const sampled = texture(u.tex, cellCenterUv).rgb.toVar();

		// Luminance with brightness/contrast, clamped to [0,1].
		const lum = dot(sampled, LUM_COEF)
			.sub(0.5)
			.mul(u.contrast)
			.add(0.5)
			.add(u.brightness);
		const lumClamped = max(lum, 0.0).min(1.0).toVar();
		const lumFinal = mix(lumClamped, oneMinus(lumClamped), u.invert).toVar();

		// Fragment position inside its cell, centered.
		const fc = fract(cell).toVar();
		const p = fc.sub(0.5).toVar();

		const d = shapeDistance(p, u.shape);

		// Dot radius scales with luminance.
		const radius = lumFinal.mul(0.5).mul(u.dotScale);
		const mask = step(d, radius);

		const dotColor = mix(u.tint, sampled, u.colorMode);
		return vec4(mix(u.bgColor, dotColor, mask), 1.0);
	})();
}

import type { Color } from "three";
import {
	abs,
	cos,
	dot,
	Fn,
	floor,
	fract,
	length,
	max,
	mix,
	oneMinus,
	type ShaderNodeObject,
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

const LUM_COEF = vec3(0.299, 0.587, 0.114);

/**
 * Build a halftone TSL color node (vec4) from the given uniforms.
 * Flow: rotate UV → grid quantize → sample texture at cell center →
 * luminance → dot radius → draw dot (circle/square) → colorize.
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
		let lum = dot(sampled, LUM_COEF);
		lum = lum.sub(0.5).mul(u.contrast).add(0.5).add(u.brightness);
		lum = max(lum, 0.0);
		lum = lum.min(1.0);
		lum = mix(lum, oneMinus(lum), u.invert);

		// Fragment position inside its cell (0..1).
		const fc = fract(cell).toVar();
		const distCircle = length(fc.sub(0.5));
		const distSquare = max(abs(fc.x.sub(0.5)), abs(fc.y.sub(0.5)));
		const d = mix(distCircle, distSquare, u.shape);

		// Dot radius scales with luminance.
		const radius = lum.mul(0.5).mul(u.dotScale);
		const mask = step(d, radius);

		const dotColor = mix(u.tint, sampled, u.colorMode);
		return vec4(mix(u.bgColor, dotColor, mask), 1.0);
	})();
}

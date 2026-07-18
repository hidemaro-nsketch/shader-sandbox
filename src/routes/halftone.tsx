import "../util/webgpu-polyfill";

import { OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Color, TextureLoader } from "three";
import { uniform } from "three/tsl";
import { MeshBasicNodeMaterial, WebGPURenderer } from "three/webgpu";
import HalftoneControls, {
	type HalftoneParamValues,
} from "../components/HalftoneControls";
import { buildHalftoneColorNode } from "../util/halftone";

const SAMPLE_IMAGE = "/sample-photo.jpg";
const DEFAULT_PARAMS: HalftoneParamValues = {
	cells: 120,
	dotScale: 1.0,
	angle: Math.PI / 6,
	contrast: 1.0,
	brightness: 0,
	invert: false,
	shape: "circle",
	colorMode: "mono",
	tint: "#0ea5e9",
	bgColor: "#0b1220",
};

/** Convert #rrggbb to [r,g,b] 0..1. */
function hexToRgb(hex: string): [number, number, number] {
	const m = hex.replace("#", "");
	const r = parseInt(m.slice(0, 2), 16) / 255;
	const g = parseInt(m.slice(2, 4), 16) / 255;
	const b = parseInt(m.slice(4, 6), 16) / 255;
	return [r, g, b];
}

export const Route = createFileRoute("/halftone")({
	component: HalftonePage,
});

function HalftonePage() {
	const [params, setParams] = useState<HalftoneParamValues>(DEFAULT_PARAMS);
	const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGE);
	const [imageName, setImageName] = useState("sample-photo.jpg");
	const objectUrlRef = useRef<string | null>(null);

	const handleChange = <K extends keyof HalftoneParamValues>(
		key: K,
		value: HalftoneParamValues[K],
	) => setParams((p) => ({ ...p, [key]: value }));

	const handleImageUpload = (file: File) => {
		if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
		const url = URL.createObjectURL(file);
		objectUrlRef.current = url;
		setImageUrl(url);
		setImageName(file.name);
	};

	const handleResetSample = () => {
		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current);
			objectUrlRef.current = null;
		}
		setImageUrl(SAMPLE_IMAGE);
		setImageName("sample-photo.jpg");
	};

	useEffect(() => {
		return () => {
			if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
		};
	}, []);

	return (
		<div className="w-screen h-screen flex bg-slate-950 overflow-hidden">
			<div className="flex-1 relative">
				<Suspense fallback={null}>
					<Canvas
						gl={async (props) => {
							const renderer = new WebGPURenderer({
								...props,
								forceWebGL: !navigator.gpu,
								antialias: true,
							});
							await renderer.init();
							return renderer;
						}}
						style={{ pointerEvents: "none" }}
					>
						<OrthographicCamera makeDefault position={[0, 0, 1]} />
						<Suspense fallback={null}>
							<HalftoneScene imageUrl={imageUrl} params={params} />
						</Suspense>
					</Canvas>
				</Suspense>
			</div>
			<HalftoneControls
				params={params}
				onChange={handleChange}
				onImageUpload={handleImageUpload}
				onResetSample={handleResetSample}
				imageName={imageName}
			/>
		</div>
	);
}

function HalftoneScene({
	imageUrl,
	params,
}: {
	imageUrl: string;
	params: HalftoneParamValues;
}) {
	const texture = useLoader(TextureLoader, imageUrl);
	const { width, height } = useThree((s) => s.viewport);

	// Build uniforms once; subsequent param changes update .value in-place
	// via the effect below (avoids rebuilding the TSL node graph).
	// biome-ignore lint/correctness/useExhaustiveDependencies: uniforms are intentionally created once
	const uniforms = useMemo(() => {
		const [tr, tg, tb] = hexToRgb(params.tint);
		const [br, bg, bb] = hexToRgb(params.bgColor);
		return {
			cells: uniform(params.cells),
			dotScale: uniform(params.dotScale),
			angle: uniform(params.angle),
			contrast: uniform(params.contrast),
			brightness: uniform(params.brightness),
			invert: uniform(params.invert ? 1 : 0),
			shape: uniform(params.shape === "square" ? 1 : 0),
			colorMode: uniform(params.colorMode === "color" ? 1 : 0),
			tint: uniform(new Color(tr, tg, tb)),
			bgColor: uniform(new Color(br, bg, bb)),
		};
	}, []);

	// Keep uniforms in sync with params without rebuilding the node.
	useEffect(() => {
		uniforms.cells.value = params.cells;
		uniforms.dotScale.value = params.dotScale;
		uniforms.angle.value = params.angle;
		uniforms.contrast.value = params.contrast;
		uniforms.brightness.value = params.brightness;
		uniforms.invert.value = params.invert ? 1 : 0;
		uniforms.shape.value = params.shape === "square" ? 1 : 0;
		uniforms.colorMode.value = params.colorMode === "color" ? 1 : 0;
		const [tr, tg, tb] = hexToRgb(params.tint);
		const [br, bg, bb] = hexToRgb(params.bgColor);
		uniforms.tint.value.setRGB(tr, tg, tb);
		uniforms.bgColor.value.setRGB(br, bg, bb);
	}, [params, uniforms]);

	const material = useMemo(() => {
		const mat = new MeshBasicNodeMaterial();
		mat.colorNode = buildHalftoneColorNode({
			tex: texture,
			cells: uniforms.cells,
			dotScale: uniforms.dotScale,
			angle: uniforms.angle,
			contrast: uniforms.contrast,
			brightness: uniforms.brightness,
			invert: uniforms.invert,
			shape: uniforms.shape,
			colorMode: uniforms.colorMode,
			tint: uniforms.tint,
			bgColor: uniforms.bgColor,
		});
		return mat;
	}, [texture, uniforms]);

	// Fit the photo aspect into the viewport (letterbox via plane scale).
	const scale = useMemo(() => {
		const imgAspect = texture.image
			? (texture.image as HTMLImageElement).width /
				(texture.image as HTMLImageElement).height
			: 1;
		const viewAspect = width / height;
		let w: number;
		let h: number;
		if (imgAspect > viewAspect) {
			w = width;
			h = width / imgAspect;
		} else {
			h = height;
			w = height * imgAspect;
		}
		return [w, h, 1] as [number, number, number];
	}, [texture, width, height]);

	// Continuous render so live uniform updates stay visible.
	useFrame(() => {});

	return (
		<mesh scale={scale} material={material}>
			<planeGeometry args={[1, 1]} />
		</mesh>
	);
}

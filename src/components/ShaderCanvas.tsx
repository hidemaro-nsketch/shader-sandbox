// Must run before any three/webgpu or three/tsl module is evaluated.
import "../util/webgpu-polyfill";

import { OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { type ReactNode, Suspense } from "react";
import { WebGPURenderer } from "three/webgpu";

/** Parameters accepted by the WebGPU renderer constructor. */
type WebGPURendererParameters = ConstructorParameters<typeof WebGPURenderer>[0];

type ShaderCanvasProps = {
	/** R3F scene contents (meshes, lights, loaders, ...). */
	children: ReactNode;
	/** Extra classes for the canvas container (size, rounding, ...). */
	className?: string;
	/** Show the floating "Sandbox" link back to the gallery. */
	backLink?: boolean;
};

/**
 * Full-screen shader canvas shared by every experiment.
 *
 * Sets up a `WebGPURenderer` (falling back to WebGL when WebGPU is missing),
 * an orthographic camera looking down -Z, and a Suspense boundary inside the
 * canvas. Experiments only supply the scene.
 */
export function ShaderCanvas({
	children,
	className = "",
	backLink = true,
}: ShaderCanvasProps) {
	return (
		<div
			className={`relative h-full w-full overflow-hidden bg-black ${className}`}
		>
			<Canvas
				gl={async (props) => {
					const renderer = new WebGPURenderer({
						...(props as unknown as WebGPURendererParameters),
						forceWebGL: !navigator.gpu,
						antialias: true,
					});
					await renderer.init();
					return renderer;
				}}
				style={{ pointerEvents: "none" }}
			>
				<OrthographicCamera makeDefault position={[0, 0, 1]} />
				<Suspense fallback={null}>{children}</Suspense>
			</Canvas>

			{backLink && (
				<Link
					to="/"
					className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-sm text-white/70 backdrop-blur-md transition-colors hover:border-white/25 hover:text-white"
				>
					<ArrowLeft size={14} />
					Sandbox
				</Link>
			)}
		</div>
	);
}

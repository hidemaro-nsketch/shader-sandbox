import { useFrame, useThree } from "@react-three/fiber";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Fn, screenSize, sin, uniform, vec3 } from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";

import { ShaderCanvas } from "../components/ShaderCanvas";
import { screenAspectUV } from "../util/shader";

const Scene = () => {
	const { nodes, uniforms } = useMemo(() => {
		const time = uniform(0.0);

		const gradientNode = Fn(() => {
			const _uv = screenAspectUV(screenSize).toVar();
			const color1 = vec3(_uv, sin(time).mul(0.5).add(0.5));
			return color1;
		});

		return {
			nodes: {
				colorNode: gradientNode(),
			},
			uniforms: {
				time,
			},
		};
	}, []);

	const { width, height } = useThree((state) => state.viewport);

	useFrame(() => {
		uniforms.time.value += 0.05;
	});

	const mat = useMemo(() => {
		const material = new MeshBasicNodeMaterial();
		material.colorNode = nodes.colorNode;
		return material;
	}, [nodes]);

	return (
		<mesh scale={[width, height, 1]} material={mat}>
			<planeGeometry args={[1, 1]} />
		</mesh>
	);
};

export const Route = createFileRoute("/basic")({
	component: BasicShaderPage,
});

function BasicShaderPage() {
	return (
		<main className="h-screen w-screen bg-white p-5 font-gothic sm:p-8">
			<div className="h-full w-full border border-black">
				<ShaderCanvas>
					<Scene />
				</ShaderCanvas>
			</div>
		</main>
	);
}

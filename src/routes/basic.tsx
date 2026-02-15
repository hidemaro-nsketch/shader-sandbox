import "../util/webgpu-polyfill";

import { OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useMemo } from "react";
import { Fn, screenSize, sin, uniform, vec3 } from "three/tsl";
import { MeshBasicNodeMaterial, WebGPURenderer } from "three/webgpu";

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
    <div className="w-screen h-screen p-12 bg-slate-900 relative">
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
          style={{
            pointerEvents: "none",
            borderRadius: 16,
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.0} />
          <OrthographicCamera makeDefault position={[0, 0, 1]} />
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}

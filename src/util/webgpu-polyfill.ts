// Polyfill GPUShaderStage for browsers that don't support WebGPU.
// Three.js references GPUShaderStage at module evaluation time,
// so this must be imported before any three/webgpu or three/tsl imports.
if (typeof globalThis.GPUShaderStage === "undefined") {
  globalThis.GPUShaderStage = {
    VERTEX: 0x1,
    FRAGMENT: 0x2,
    COMPUTE: 0x4,
  } as typeof GPUShaderStage;
}

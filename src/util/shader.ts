import { screenUV, vec2 } from "three/tsl";
import type { ShaderNodeObject, UniformNode } from "three/tsl";

export const screenAspectUV = (
  screenSize: ShaderNodeObject<UniformNode<number>>,
) => {
  const uv = screenUV.toVar();
  const aspect = screenSize.x.div(screenSize.y);
  uv.x.mulAssign(aspect);
  return vec2(uv.x, uv.y);
};

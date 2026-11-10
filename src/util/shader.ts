import { screenUV, vec2 } from "three/tsl";
import type { Node } from "three/webgpu";

export const screenAspectUV = (screenSize: Node) => {
	const uv = screenUV.toVar();
	const aspect = screenSize.x.div(screenSize.y);
	uv.x.mulAssign(aspect);
	return vec2(uv.x, uv.y);
};

/**
 * Registry of visual experiments shown on the home gallery.
 *
 * Single source of truth: the home page grid is generated from this list, so
 * adding a new experiment means adding one route file
 * (`src/routes/<name>.tsx`), one preview image in `public/previews/`, and one
 * entry here.
 */
export type Experiment = {
	/** Route path of the experiment (must exist in `src/routes`). */
	to:
		| "/aikido-banners"
		| "/aikido-burst"
		| "/aikido-container"
		| "/aikido-hero"
		| "/aikido-pentest"
		| "/aikido-reviews"
		| "/halftone"
		| "/handoff"
		| "/paper-chain"
		| "/surface-plots"
		| "/wireframe";
	title: string;
	/** Screenshot shown on the gallery card (public/previews). */
	preview: string;
	/** Short labels for the card ("tsl", "posterize", ...). */
	tags: readonly string[];
};

export const experiments: readonly Experiment[] = [
	{
		to: "/aikido-hero",
		title: "Aikido Hero",
		preview: "/previews/aikido-hero.webp",
		tags: ["brand", "landing"],
	},
	{
		to: "/aikido-banners",
		title: "Aikido Banners",
		preview: "/previews/aikido-banners.webp",
		tags: ["brand", "banner"],
	},
	{
		to: "/aikido-container",
		title: "Container × Security",
		preview: "/previews/aikido-container.webp",
		tags: ["brand", "isometric"],
	},
	{
		to: "/aikido-reviews",
		title: "Code Reviews",
		preview: "/previews/aikido-reviews.webp",
		tags: ["brand", "poster"],
	},
	{
		to: "/aikido-pentest",
		title: "Agentic Pentesting",
		preview: "/previews/aikido-pentest.webp",
		tags: ["brand", "card"],
	},
	{
		to: "/aikido-burst",
		title: "Attack Burst",
		preview: "/previews/aikido-burst.webp",
		tags: ["brand", "burst"],
	},
	{
		to: "/halftone",
		title: "Halftone",
		preview: "/previews/halftone.webp",
		tags: ["image", "halftone"],
	},
	{
		to: "/handoff",
		title: "Handoff Tower",
		preview: "/previews/handoff.webp",
		tags: ["poster", "mosaic"],
	},
	{
		to: "/paper-chain",
		title: "Paper Chain",
		preview: "/previews/paper-chain.webp",
		tags: ["poster", "svg"],
	},
	{
		to: "/surface-plots",
		title: "Surface Plots",
		preview: "/previews/surface-plots.webp",
		tags: ["data-viz", "wireframe"],
	},
	{
		to: "/wireframe",
		title: "Wireframe Torus",
		preview: "/previews/wireframe.webp",
		tags: ["cad", "3d"],
	},
];

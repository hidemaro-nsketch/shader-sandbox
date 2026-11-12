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

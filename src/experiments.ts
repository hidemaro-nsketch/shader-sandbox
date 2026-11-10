import { CircleDot, type LucideIcon, Sparkles } from "lucide-react";

/**
 * Registry of visual experiments shown on the home gallery.
 *
 * Single source of truth: the home page grid and the floating navigation are
 * both generated from this list, so adding a new experiment means adding one
 * route file (`src/routes/<name>.tsx`) plus one entry here.
 */
export type Experiment = {
	/** Route path of the experiment (must exist in `src/routes`). */
	to: "/basic" | "/halftone";
	title: string;
	/** One or two sentences describing what the visual does. */
	description: string;
	/** Short labels for the card ("tsl", "posterize", ...). */
	tags: readonly string[];
	icon: LucideIcon;
	/** Tailwind gradient classes used for the card accent. */
	accent: string;
};

export const experiments: readonly Experiment[] = [
	{
		to: "/basic",
		title: "Basic",
		description:
			"UV gradient with a time-driven color animation, written in TSL.",
		tags: ["tsl", "gradient", "animated"],
		icon: Sparkles,
		accent: "from-cyan-500/20 to-sky-500/5",
	},
	{
		to: "/halftone",
		title: "Halftone",
		description:
			"Photo halftone (screen-dot) effect with a live panel for density, shape, angle, tone and color modes.",
		tags: ["image", "halftone", "interactive"],
		icon: CircleDot,
		accent: "from-fuchsia-500/20 to-violet-500/5",
	},
];

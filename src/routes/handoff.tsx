import { createFileRoute } from "@tanstack/react-router";
import { Dices, Download } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { HandoffTower } from "../components/HandoffTower";
import {
	ActionButton,
	BackLink,
	ExperimentLayout,
	Frame,
	Lead,
	PageTitle,
	Panel,
	Section,
	Slider,
	Stage,
	Toggle,
} from "../components/ui/Controls";
import { createHandoffTower, TOWER_POSTER } from "../util/handoffTower";

export const Route = createFileRoute("/handoff")({
	component: HandoffPage,
});

type Params = {
	seed: number;
	towers: number;
	wordmark: string;
	labels: boolean;
	textures: boolean;
	grain: boolean;
};

const DEFAULT_PARAMS: Params = {
	seed: 20,
	towers: 8,
	wordmark: "Collab",
	labels: true,
	textures: true,
	grain: true,
};

function HandoffPage() {
	const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
	const svgRef = useRef<SVGSVGElement>(null);

	const set = <K extends keyof Params>(key: K, value: Params[K]) =>
		setParams((p) => ({ ...p, [key]: value }));

	const layout = useMemo(
		() => createHandoffTower({ seed: params.seed, towers: params.towers }),
		[params.seed, params.towers],
	);

	const downloadPng = useCallback(() => {
		const svg = svgRef.current;
		if (!svg) return;
		const clone = svg.cloneNode(true) as SVGSVGElement;
		clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		clone.setAttribute("width", String(TOWER_POSTER.width));
		clone.setAttribute("height", String(TOWER_POSTER.height));

		const source = new XMLSerializer().serializeToString(clone);
		const svgUrl = URL.createObjectURL(
			new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
		);
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = TOWER_POSTER.width;
			canvas.height = TOWER_POSTER.height;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.fillStyle = "#f3ebd8";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(svgUrl);
			canvas.toBlob((blob) => {
				if (!blob) return;
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob);
				a.download = `handoff-tower-${params.seed}.png`;
				a.click();
				URL.revokeObjectURL(a.href);
			}, "image/png");
		};
		img.src = svgUrl;
	}, [params.seed]);

	return (
		<ExperimentLayout>
			<Stage>
				<Frame ratio={TOWER_POSTER.width / TOWER_POSTER.height}>
					<HandoffTower
						svgRef={svgRef}
						layout={layout}
						wordmark={params.wordmark}
						showLabels={params.labels}
						showTextures={params.textures}
						showGrain={params.grain}
						seed={params.seed}
					/>
				</Frame>
			</Stage>

			<Panel>
				<BackLink />
				<PageTitle>Handoff Tower</PageTitle>
				<Lead>
					Pixel-mosaic org chart. Blue pipes fork from two caps down to a row of
					bowtie connectors, then fan out into the lower band.
				</Lead>

				<Section title="Column">
					<Slider
						label="Handoffs"
						value={params.towers}
						min={4}
						max={8}
						step={1}
						format={(v) => String(Math.round(v))}
						onChange={(v) => set("towers", Math.round(v))}
					/>
					<Slider
						label="Seed"
						value={params.seed}
						min={0}
						max={999}
						step={1}
						format={(v) => String(Math.round(v))}
						onChange={(v) => set("seed", Math.round(v))}
					/>
					<label className="mb-4 block">
						<span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em]">
							Wordmark
						</span>
						<input
							type="text"
							value={params.wordmark}
							maxLength={16}
							onChange={(e) => set("wordmark", e.target.value)}
							className="w-full border border-black bg-white px-2.5 py-1.5 text-[12px] outline-none focus:bg-black focus:text-white"
						/>
					</label>
				</Section>

				<Section title="Overlay">
					<Toggle
						label="Labels"
						value={params.labels}
						onChange={(v) => set("labels", v)}
					/>
					<Toggle
						label="Textures"
						value={params.textures}
						onChange={(v) => set("textures", v)}
					/>
					<Toggle
						label="Grain"
						value={params.grain}
						onChange={(v) => set("grain", v)}
					/>
				</Section>

				<div className="mt-8 flex gap-2">
					<ActionButton
						onClick={() => set("seed", Math.floor(Math.random() * 100000))}
						icon={<Dices size={12} />}
					>
						Shuffle
					</ActionButton>
					<ActionButton
						onClick={downloadPng}
						icon={<Download size={12} />}
						variant="outline"
					>
						PNG
					</ActionButton>
				</div>
			</Panel>
		</ExperimentLayout>
	);
}

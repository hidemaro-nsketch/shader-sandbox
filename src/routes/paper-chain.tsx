import { createFileRoute } from "@tanstack/react-router";
import { Dices, Download } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { PaperPoster } from "../components/PaperPoster";
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
import { createPaperPoster, POSTER } from "../util/paperPoster";

export const Route = createFileRoute("/paper-chain")({
	component: PaperChainPage,
});

type Params = {
	seed: number;
	figures: number;
	wobble: number;
	wordmark: string;
	showLabels: boolean;
	showGrain: boolean;
};

const DEFAULT_PARAMS: Params = {
	seed: 7,
	figures: 9,
	wobble: 12,
	wordmark: "Collab",
	showLabels: true,
	showGrain: true,
};

function PaperChainPage() {
	const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
	const svgRef = useRef<SVGSVGElement>(null);

	const set = <K extends keyof Params>(key: K, value: Params[K]) =>
		setParams((p) => ({ ...p, [key]: value }));

	const layout = useMemo(
		() =>
			createPaperPoster({
				seed: params.seed,
				figureCount: params.figures,
				wordmark: params.wordmark,
			}),
		[params.seed, params.figures, params.wordmark],
	);

	const downloadPng = useCallback(() => {
		const svg = svgRef.current;
		if (!svg) return;
		const clone = svg.cloneNode(true) as SVGSVGElement;
		clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		clone.setAttribute("width", String(POSTER.width));
		clone.setAttribute("height", String(POSTER.height));

		const source = new XMLSerializer().serializeToString(clone);
		const svgUrl = URL.createObjectURL(
			new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
		);
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = POSTER.width;
			canvas.height = POSTER.height;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(svgUrl);
			canvas.toBlob((blob) => {
				if (!blob) return;
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob);
				a.download = `paper-chain-${params.seed}.png`;
				a.click();
				URL.revokeObjectURL(a.href);
			}, "image/png");
		};
		img.src = svgUrl;
	}, [params.seed]);

	return (
		<ExperimentLayout>
			<Stage>
				<Frame ratio={POSTER.width / POSTER.height}>
					<PaperPoster
						svgRef={svgRef}
						layout={layout}
						wordmark={params.wordmark}
						wobble={params.wobble}
						showLabels={params.showLabels}
						showGrain={params.showGrain}
						seed={params.seed}
					/>
				</Frame>
			</Stage>

			<Panel>
				<BackLink />
				<PageTitle>Paper Chain</PageTitle>
				<Lead>
					Cut-paper human chain poster generator. Every seed rearranges the
					figures, pixel patches and labels.
				</Lead>

				<Section title="Figure">
					<Slider
						label="Count"
						value={params.figures}
						min={5}
						max={16}
						step={1}
						format={(v) => String(Math.round(v))}
						onChange={(v) => set("figures", Math.round(v))}
					/>
					<Slider
						label="Wobble"
						value={params.wobble}
						min={0}
						max={26}
						step={1}
						format={(v) => String(Math.round(v))}
						onChange={(v) => set("wobble", Math.round(v))}
					/>
				</Section>

				<Section title="Layout">
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
						value={params.showLabels}
						onChange={(v) => set("showLabels", v)}
					/>
					<Toggle
						label="Grain"
						value={params.showGrain}
						onChange={(v) => set("showGrain", v)}
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

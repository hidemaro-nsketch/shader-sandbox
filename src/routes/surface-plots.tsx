import { createFileRoute } from "@tanstack/react-router";
import { Dices, Download } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { SurfacePlotPoster } from "../components/SurfacePlotPoster";
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
import { PLOTS_POSTER } from "../util/surfacePlots";

export const Route = createFileRoute("/surface-plots")({
	component: SurfacePlotsPage,
});

function SurfacePlotsPage() {
	const [seed, setSeed] = useState(11);
	const [density, setDensity] = useState(30);
	const [showFill, setShowFill] = useState(true);
	const svgRef = useRef<SVGSVGElement>(null);

	const downloadPng = useCallback(() => {
		const svg = svgRef.current;
		if (!svg) return;
		const clone = svg.cloneNode(true) as SVGSVGElement;
		clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		clone.setAttribute("width", String(PLOTS_POSTER.width));
		clone.setAttribute("height", String(PLOTS_POSTER.height));

		const source = new XMLSerializer().serializeToString(clone);
		const svgUrl = URL.createObjectURL(
			new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
		);
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = PLOTS_POSTER.width;
			canvas.height = PLOTS_POSTER.height;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.fillStyle = "#111110";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(svgUrl);
			canvas.toBlob((blob) => {
				if (!blob) return;
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob);
				a.download = `surface-plots-${seed}.png`;
				a.click();
				URL.revokeObjectURL(a.href);
			}, "image/png");
		};
		img.src = svgUrl;
	}, [seed]);

	return (
		<ExperimentLayout>
			<Stage>
				<Frame ratio={PLOTS_POSTER.width / PLOTS_POSTER.height}>
					<SurfacePlotPoster
						svgRef={svgRef}
						seed={seed}
						density={density}
						showFill={showFill}
					/>
				</Frame>
			</Stage>

			<Panel>
				<BackLink />
				<PageTitle>Surface Plots</PageTitle>
				<Lead>
					Axonometric wireframe terrains (years × countries × value) with a
					projection wall, in the style of a dark data-viz poster.
				</Lead>

				<Section title="Terrain">
					<Slider
						label="Wireframe density"
						value={density}
						min={12}
						max={48}
						step={1}
						format={(v) => String(Math.round(v))}
						onChange={(v) => setDensity(Math.round(v))}
					/>
					<Slider
						label="Seed"
						value={seed}
						min={0}
						max={999}
						step={1}
						format={(v) => String(Math.round(v))}
						onChange={(v) => setSeed(Math.round(v))}
					/>
				</Section>

				<Section title="Overlay">
					<Toggle
						label="Projection wall"
						value={showFill}
						onChange={setShowFill}
					/>
				</Section>

				<div className="mt-8 flex gap-2">
					<ActionButton
						onClick={() => setSeed(Math.floor(Math.random() * 100000))}
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

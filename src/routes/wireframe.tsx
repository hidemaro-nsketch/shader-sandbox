import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useCallback, useRef, useState } from "react";
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
import {
	type WireframeParams,
	WireframeTorus,
} from "../components/WireframeTorus";
import { CAD_POSTER } from "../util/wireframeTorus";

export const Route = createFileRoute("/wireframe")({
	component: WireframePage,
});

const DEFAULTS: WireframeParams = {
	azimuth: -32,
	elevation: 20,
	segments: 22,
	sides: 12,
	showGrid: true,
	showDimensions: true,
};

function WireframePage() {
	const [params, setParams] = useState<WireframeParams>(DEFAULTS);
	const svgRef = useRef<SVGSVGElement>(null);

	const set = <K extends keyof WireframeParams>(
		key: K,
		value: WireframeParams[K],
	) => setParams((p) => ({ ...p, [key]: value }));

	const downloadPng = useCallback(() => {
		const svg = svgRef.current;
		if (!svg) return;
		const clone = svg.cloneNode(true) as SVGSVGElement;
		clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		clone.setAttribute("width", String(CAD_POSTER.width));
		clone.setAttribute("height", String(CAD_POSTER.height));

		const source = new XMLSerializer().serializeToString(clone);
		const svgUrl = URL.createObjectURL(
			new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
		);
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = CAD_POSTER.width;
			canvas.height = CAD_POSTER.height;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.fillStyle = "#151513";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(svgUrl);
			canvas.toBlob((blob) => {
				if (!blob) return;
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob);
				a.download = "wireframe-torus.png";
				a.click();
				URL.revokeObjectURL(a.href);
			}, "image/png");
		};
		img.src = svgUrl;
	}, []);

	return (
		<ExperimentLayout>
			<Stage>
				<Frame ratio={CAD_POSTER.width / CAD_POSTER.height}>
					<WireframeTorus svgRef={svgRef} {...params} />
				</Frame>
			</Stage>

			<Panel>
				<BackLink />
				<PageTitle>Wireframe Torus</PageTitle>
				<Lead>
					CAD-style wireframe render: transparent housing, floor grid, mm
					dimensions and a glowing hub part.
				</Lead>

				<Section title="View">
					<Slider
						label="Azimuth"
						value={params.azimuth}
						min={-90}
						max={90}
						step={1}
						format={(v) => `${v}°`}
						onChange={(v) => set("azimuth", Math.round(v))}
					/>
					<Slider
						label="Elevation"
						value={params.elevation}
						min={2}
						max={60}
						step={1}
						format={(v) => `${v}°`}
						onChange={(v) => set("elevation", Math.round(v))}
					/>
				</Section>

				<Section title="Mesh">
					<Slider
						label="Meridians"
						value={params.segments}
						min={8}
						max={48}
						step={1}
						format={(v) => String(Math.round(v))}
						onChange={(v) => set("segments", Math.round(v))}
					/>
					<Slider
						label="Tube rings"
						value={params.sides}
						min={6}
						max={24}
						step={1}
						format={(v) => String(Math.round(v))}
						onChange={(v) => set("sides", Math.round(v))}
					/>
				</Section>

				<Section title="Overlay">
					<Toggle
						label="Floor grid"
						value={params.showGrid}
						onChange={(v) => set("showGrid", v)}
					/>
					<Toggle
						label="Dimensions"
						value={params.showDimensions}
						onChange={(v) => set("showDimensions", v)}
					/>
				</Section>

				<div className="mt-8 flex gap-2">
					<ActionButton onClick={downloadPng} icon={<Download size={12} />}>
						Export PNG
					</ActionButton>
				</div>
			</Panel>
		</ExperimentLayout>
	);
}

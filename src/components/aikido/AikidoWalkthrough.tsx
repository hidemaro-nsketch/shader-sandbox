import { ArrowLeft, ArrowRight } from "lucide-react";
import { type ReactNode, useState } from "react";
import { AIKIDO_POSTER } from "../../util/aikido";
import type { WalkthroughStep } from "../../util/aikidoSteps";
import { ActionButton, BackLink, Frame, Panel } from "../ui/Controls";

/** Preview on the left, the code that drew the current layer on the right. */
export function AikidoWalkthrough({
	steps,
	renderArtwork,
}: {
	steps: readonly WalkthroughStep[];
	/** Draws the artwork with only its first `stage` layers (1..steps.length). */
	renderArtwork: (stage: number) => ReactNode;
}) {
	const [index, setIndex] = useState(0);
	const step = steps[index];
	const last = steps.length - 1;

	return (
		<>
			<main className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center p-4 sm:p-8">
				<BackLink className="absolute top-3 left-3 z-10 border border-black bg-white/90 px-2.5 py-1.5 backdrop-blur-sm sm:top-4 sm:left-4" />
				<Frame ratio={AIKIDO_POSTER.width / AIKIDO_POSTER.height}>
					{renderArtwork(index + 1)}
				</Frame>
			</main>
			<Panel>
				<p className="text-[10px] uppercase tracking-[0.16em]">
					Step {index + 1} / {steps.length}
				</p>
				<h1 className="mt-2 text-lg font-medium">{step.title}</h1>
				<p className="mt-3 text-sm leading-relaxed">{step.note}</p>
				<pre className="mt-4 overflow-x-auto border border-black bg-neutral-50 p-3 font-mono text-[11px] leading-relaxed">
					<code>{step.code}</code>
				</pre>
				<div className="mt-5 flex gap-2">
					<ActionButton
						variant="outline"
						icon={<ArrowLeft size={12} />}
						onClick={() => setIndex((i) => Math.max(0, i - 1))}
					>
						前へ
					</ActionButton>
					<ActionButton
						icon={<ArrowRight size={12} />}
						onClick={() => setIndex((i) => Math.min(last, i + 1))}
					>
						次へ
					</ActionButton>
				</div>
			</Panel>
		</>
	);
}

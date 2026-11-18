import { createFileRoute, Link } from "@tanstack/react-router";
import { AikidoBurst } from "../components/aikido/AikidoBurst";
import {
	ArtworkStage,
	ExperimentLayout,
	Frame,
} from "../components/ui/Controls";
import { AIKIDO_POSTER } from "../util/aikido";

export const Route = createFileRoute("/aikido-burst")({
	component: BurstPage,
});

function BurstPage() {
	return (
		<ExperimentLayout>
			<ArtworkStage>
				<Frame ratio={AIKIDO_POSTER.width / AIKIDO_POSTER.height}>
					<AikidoBurst />
				</Frame>
				<Link
					to="/aikido-burst-steps"
					className="absolute top-3 right-3 z-10 border border-black bg-white/90 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.16em] backdrop-blur-sm sm:top-4 sm:right-4"
				>
					手順を見る
				</Link>
			</ArtworkStage>
		</ExperimentLayout>
	);
}

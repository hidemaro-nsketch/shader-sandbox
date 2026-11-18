import { createFileRoute, Link } from "@tanstack/react-router";
import { AikidoContainer } from "../components/aikido/AikidoContainer";
import {
	ArtworkStage,
	ExperimentLayout,
	Frame,
} from "../components/ui/Controls";
import { AIKIDO_POSTER } from "../util/aikido";

export const Route = createFileRoute("/aikido-container")({
	component: ContainerPage,
});

function ContainerPage() {
	return (
		<ExperimentLayout>
			<ArtworkStage>
				<Frame ratio={AIKIDO_POSTER.width / AIKIDO_POSTER.height}>
					<AikidoContainer />
				</Frame>
				<Link
					to="/aikido-container-steps"
					className="absolute top-3 right-3 z-10 border border-black bg-white/90 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.16em] backdrop-blur-sm sm:top-4 sm:right-4"
				>
					手順を見る
				</Link>
			</ArtworkStage>
		</ExperimentLayout>
	);
}

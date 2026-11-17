import { createFileRoute } from "@tanstack/react-router";
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
			</ArtworkStage>
		</ExperimentLayout>
	);
}

import { createFileRoute } from "@tanstack/react-router";
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
			</ArtworkStage>
		</ExperimentLayout>
	);
}

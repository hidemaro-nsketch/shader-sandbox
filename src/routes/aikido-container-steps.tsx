import { createFileRoute } from "@tanstack/react-router";
import { AikidoContainer } from "../components/aikido/AikidoContainer";
import { AikidoWalkthrough } from "../components/aikido/AikidoWalkthrough";
import { ExperimentLayout } from "../components/ui/Controls";
import { CONTAINER_STEPS } from "../util/aikidoContainerSteps";

export const Route = createFileRoute("/aikido-container-steps")({
	component: ContainerStepsPage,
});

function ContainerStepsPage() {
	return (
		<ExperimentLayout>
			<AikidoWalkthrough
				steps={CONTAINER_STEPS}
				renderArtwork={(stage) => <AikidoContainer stage={stage} />}
			/>
		</ExperimentLayout>
	);
}

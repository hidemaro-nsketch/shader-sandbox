import { createFileRoute } from "@tanstack/react-router";
import { AikidoBurst } from "../components/aikido/AikidoBurst";
import { AikidoWalkthrough } from "../components/aikido/AikidoWalkthrough";
import { ExperimentLayout } from "../components/ui/Controls";
import { BURST_STEPS } from "../util/aikidoBurstSteps";

export const Route = createFileRoute("/aikido-burst-steps")({
	component: BurstStepsPage,
});

function BurstStepsPage() {
	return (
		<ExperimentLayout>
			<AikidoWalkthrough
				steps={BURST_STEPS}
				renderArtwork={(stage) => <AikidoBurst stage={stage} />}
			/>
		</ExperimentLayout>
	);
}

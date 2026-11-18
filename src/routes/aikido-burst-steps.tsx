import { createFileRoute } from "@tanstack/react-router";
import { AikidoBurstWalkthrough } from "../components/aikido/AikidoBurstWalkthrough";
import { ExperimentLayout } from "../components/ui/Controls";

export const Route = createFileRoute("/aikido-burst-steps")({
	component: BurstStepsPage,
});

function BurstStepsPage() {
	return (
		<ExperimentLayout>
			<AikidoBurstWalkthrough />
		</ExperimentLayout>
	);
}

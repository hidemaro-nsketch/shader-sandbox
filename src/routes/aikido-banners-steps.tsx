import { createFileRoute } from "@tanstack/react-router";
import { AikidoBanners } from "../components/aikido/AikidoBanners";
import { AikidoWalkthrough } from "../components/aikido/AikidoWalkthrough";
import { ExperimentLayout } from "../components/ui/Controls";
import { BANNERS_STEPS } from "../util/aikidoBannersSteps";

export const Route = createFileRoute("/aikido-banners-steps")({
	component: BannersStepsPage,
});

function BannersStepsPage() {
	return (
		<ExperimentLayout>
			<AikidoWalkthrough
				steps={BANNERS_STEPS}
				renderArtwork={(stage) => <AikidoBanners stage={stage} />}
			/>
		</ExperimentLayout>
	);
}

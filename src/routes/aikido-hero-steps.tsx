import { createFileRoute } from "@tanstack/react-router";
import { AikidoHero } from "../components/aikido/AikidoHero";
import { AikidoWalkthrough } from "../components/aikido/AikidoWalkthrough";
import { ExperimentLayout } from "../components/ui/Controls";
import { HERO_STEPS } from "../util/aikidoHeroSteps";

export const Route = createFileRoute("/aikido-hero-steps")({
	component: HeroStepsPage,
});

function HeroStepsPage() {
	return (
		<ExperimentLayout>
			<AikidoWalkthrough
				steps={HERO_STEPS}
				renderArtwork={(stage) => <AikidoHero stage={stage} />}
			/>
		</ExperimentLayout>
	);
}

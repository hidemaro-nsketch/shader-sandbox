import { createFileRoute } from "@tanstack/react-router";
import { AikidoHero } from "../components/aikido/AikidoHero";
import {
	ArtworkStage,
	ExperimentLayout,
	Frame,
} from "../components/ui/Controls";
import { AIKIDO_POSTER } from "../util/aikido";

export const Route = createFileRoute("/aikido-hero")({
	component: HeroPage,
});

function HeroPage() {
	return (
		<ExperimentLayout>
			<ArtworkStage>
				<Frame ratio={AIKIDO_POSTER.width / AIKIDO_POSTER.height}>
					<AikidoHero />
				</Frame>
			</ArtworkStage>
		</ExperimentLayout>
	);
}

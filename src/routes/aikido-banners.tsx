import { createFileRoute } from "@tanstack/react-router";
import { AikidoBanners } from "../components/aikido/AikidoBanners";
import {
	ArtworkStage,
	ExperimentLayout,
	Frame,
} from "../components/ui/Controls";
import { AIKIDO_POSTER } from "../util/aikido";

export const Route = createFileRoute("/aikido-banners")({
	component: BannersPage,
});

function BannersPage() {
	return (
		<ExperimentLayout>
			<ArtworkStage>
				<Frame ratio={AIKIDO_POSTER.width / AIKIDO_POSTER.height}>
					<AikidoBanners />
				</Frame>
			</ArtworkStage>
		</ExperimentLayout>
	);
}

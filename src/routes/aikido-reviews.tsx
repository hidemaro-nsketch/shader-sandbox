import { createFileRoute } from "@tanstack/react-router";
import { AikidoReviews } from "../components/aikido/AikidoReviews";
import {
	ArtworkStage,
	ExperimentLayout,
	Frame,
} from "../components/ui/Controls";
import { AIKIDO_POSTER } from "../util/aikido";

export const Route = createFileRoute("/aikido-reviews")({
	component: ReviewsPage,
});

function ReviewsPage() {
	return (
		<ExperimentLayout>
			<ArtworkStage>
				<Frame ratio={AIKIDO_POSTER.width / AIKIDO_POSTER.height}>
					<AikidoReviews />
				</Frame>
			</ArtworkStage>
		</ExperimentLayout>
	);
}

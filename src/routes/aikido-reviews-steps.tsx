import { createFileRoute } from "@tanstack/react-router";
import { AikidoReviews } from "../components/aikido/AikidoReviews";
import { AikidoWalkthrough } from "../components/aikido/AikidoWalkthrough";
import { ExperimentLayout } from "../components/ui/Controls";
import { REVIEWS_STEPS } from "../util/aikidoReviewsSteps";

export const Route = createFileRoute("/aikido-reviews-steps")({
	component: ReviewsStepsPage,
});

function ReviewsStepsPage() {
	return (
		<ExperimentLayout>
			<AikidoWalkthrough
				steps={REVIEWS_STEPS}
				renderArtwork={(stage) => <AikidoReviews stage={stage} />}
			/>
		</ExperimentLayout>
	);
}

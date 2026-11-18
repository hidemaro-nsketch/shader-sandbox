import { createFileRoute, Link } from "@tanstack/react-router";
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
				<Link
					to="/aikido-banners-steps"
					className="absolute top-3 right-3 z-10 border border-black bg-white/90 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.16em] backdrop-blur-sm sm:top-4 sm:right-4"
				>
					手順を見る
				</Link>
			</ArtworkStage>
		</ExperimentLayout>
	);
}

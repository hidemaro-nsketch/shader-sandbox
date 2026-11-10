import { createFileRoute, Link } from "@tanstack/react-router";
import { experiments } from "../experiments";

export const Route = createFileRoute("/")({ component: Gallery });

function Gallery() {
	return (
		<div className="min-h-screen bg-white text-black">
			<main className="mx-auto w-full max-w-[1600px] px-6 pt-6 pb-10 sm:px-8 sm:pt-8">
				<section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
					{experiments.map((exp) => (
						<Link
							key={exp.to}
							to={exp.to}
							aria-label={exp.title}
							className="group block"
						>
							<div className="overflow-hidden border border-black/10">
								<img
									src={exp.preview}
									alt={`${exp.title} screenshot`}
									width={1200}
									height={675}
									loading="lazy"
									className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
								/>
							</div>
						</Link>
					))}
				</section>
			</main>
		</div>
	);
}

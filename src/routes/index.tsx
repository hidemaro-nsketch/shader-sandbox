import { createFileRoute, Link } from "@tanstack/react-router";
import { experiments } from "../experiments";

export const Route = createFileRoute("/")({ component: Gallery });

function Gallery() {
	return (
		<div className="min-h-screen bg-white text-black">
			<main className="mx-auto max-w-6xl px-6 py-14 sm:px-10 sm:py-20">
				<section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

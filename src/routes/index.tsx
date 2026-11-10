import { createFileRoute, Link } from "@tanstack/react-router";
import { experiments } from "../experiments";

export const Route = createFileRoute("/")({ component: Gallery });

function Gallery() {
	return (
		<div className="min-h-screen bg-white text-black">
			<main className="mx-auto max-w-6xl px-6 py-14 sm:px-10 sm:py-20">
				<section className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2">
					{experiments.map((exp) => (
						<Link key={exp.to} to={exp.to} className="group block">
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
							<div className="mt-3 flex items-baseline justify-between gap-4 font-gothic">
								<h2 className="text-[20px] font-medium tracking-tight group-hover:underline group-hover:underline-offset-4">
									{exp.title}
								</h2>
								<span className="text-[11px] uppercase tracking-[0.18em]">
									{exp.tags.join(" / ")}
								</span>
							</div>
						</Link>
					))}
				</section>
			</main>
		</div>
	);
}

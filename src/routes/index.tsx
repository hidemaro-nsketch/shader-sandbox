import { createFileRoute, Link } from "@tanstack/react-router";
import { experiments } from "../experiments";

export const Route = createFileRoute("/")({ component: Gallery });

function Gallery() {
	return (
		<div className="min-h-screen bg-slate-950 text-white">
			<div className="pointer-events-none fixed inset-0 overflow-hidden">
				<div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-cyan-500/8 blur-[120px]" />
				<div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/8 blur-[120px]" />
			</div>

			<main className="relative mx-auto max-w-6xl px-6 py-14">
				<header className="mb-10 flex items-baseline justify-between gap-4">
					<h1 className="text-3xl font-black tracking-tight sm:text-4xl">
						Shader Sandbox
					</h1>
					<span className="font-mono text-xs text-slate-500">
						{experiments.length} experiments
					</span>
				</header>

				<section className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
					{experiments.map((exp) => (
						<Link key={exp.to} to={exp.to} className="group block">
							<div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-colors duration-300 group-hover:border-slate-600">
								<img
									src={exp.preview}
									alt={`${exp.title} screenshot`}
									width={1200}
									height={675}
									loading="lazy"
									className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
								/>
							</div>
							<div className="mt-3 flex items-baseline justify-between gap-4">
								<h2 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-cyan-300">
									{exp.title}
								</h2>
								<span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
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

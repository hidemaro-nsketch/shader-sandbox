import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus } from "lucide-react";
import { experiments } from "../experiments";

export const Route = createFileRoute("/")({ component: Gallery });

function Gallery() {
	return (
		<div className="min-h-screen bg-slate-950 text-white">
			{/* Ambient background */}
			<div className="pointer-events-none fixed inset-0 overflow-hidden">
				<div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-[120px]" />
				<div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-[120px]" />
			</div>

			<main className="relative mx-auto max-w-5xl px-6 py-20">
				<header className="mb-16">
					<p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan-400/80">
						three.js · TSL · WebGPU
					</p>
					<h1 className="text-5xl font-black tracking-tight sm:text-6xl">
						Shader Sandbox
					</h1>
					<p className="mt-4 max-w-xl text-gray-400">
						A playground for generative visuals. Each experiment is a route you
						can open, tweak, and copy from.
					</p>
				</header>

				<section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
					{experiments.map((exp) => {
						const Icon = exp.icon;
						return (
							<Link
								key={exp.to}
								to={exp.to}
								className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-600 hover:shadow-xl hover:shadow-black/40"
							>
								<div
									className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${exp.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
								/>
								<div className="relative">
									<div className="mb-6 flex items-start justify-between">
										<span className="rounded-xl border border-slate-700/80 bg-slate-800/80 p-2.5 text-cyan-300">
											<Icon size={18} />
										</span>
										<ArrowUpRight
											size={18}
											className="text-slate-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300"
										/>
									</div>
									<h2 className="mb-2 text-xl font-semibold tracking-tight">
										{exp.title}
									</h2>
									<p className="text-sm leading-relaxed text-gray-400">
										{exp.description}
									</p>
									<ul className="mt-5 flex flex-wrap gap-2">
										{exp.tags.map((tag) => (
											<li
												key={tag}
												className="rounded-full border border-slate-700/70 px-2.5 py-0.5 font-mono text-[11px] text-slate-400"
											>
												{tag}
											</li>
										))}
									</ul>
								</div>
							</Link>
						);
					})}

					{/* How to add the next experiment */}
					<div className="rounded-2xl border border-dashed border-slate-800 p-6 text-sm text-slate-400">
						<div className="mb-4 flex items-center gap-2 text-slate-300">
							<Plus size={16} />
							<span className="font-medium">Add an experiment</span>
						</div>
						<ol className="list-decimal space-y-1.5 pl-4">
							<li>
								Create{" "}
								<code className="text-cyan-300">
									src/routes/&lt;name&gt;.tsx
								</code>{" "}
								with <code className="text-cyan-300">createFileRoute</code>
							</li>
							<li>
								<code className="text-cyan-300">&lt;ShaderCanvas&gt;</code> for
								shader scenes, or any DOM/SVG for graphic experiments
							</li>
							<li>
								Register it in{" "}
								<code className="text-cyan-300">src/experiments.ts</code>
							</li>
						</ol>
					</div>
				</section>
			</main>
		</div>
	);
}

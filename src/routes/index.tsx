import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

const shaders = [
  {
    path: "/basic" as const,
    title: "Basic",
    description: "UV gradient with time-based color animation using TSL",
  },
];

function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <section className="py-16 px-6 text-center">
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
          Shader Sandbox
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          A collection of WebGPU shader experiments with Three.js TSL
        </p>
      </section>

      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shaders.map((shader) => (
            <Link
              key={shader.path}
              to={shader.path}
              className="group block bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {shader.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {shader.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

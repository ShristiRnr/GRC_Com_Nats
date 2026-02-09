import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Home | grc-compil" },
    { name: "description", content: "Welcome to grc-compil - A modern React Router v7 application." },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative overflow-hidden">
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="space-y-8 max-w-3xl z-10">
        <div className="inline-block px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-800 animate-fade-in">
          Next Gen Full-Stack Framework
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none bg-gradient-to-br from-gray-900 via-gray-800 to-gray-400 dark:from-white dark:via-gray-100 dark:to-gray-500 bg-clip-text text-transparent">
          Accelerate your <span className="text-blue-600">Development</span>.
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          The ultimate boilerplate for high-performance web applications. Powered by React Router v7 and a Go-powered NATS backend.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a
            href="/about"
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 hover:-translate-y-1 active:scale-95"
          >
            Explore the Docs
          </a>
          <a
            href="/contact"
            className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all hover:-translate-y-1 active:scale-95"
          >
            Get a Demo
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-24 text-left z-10">
        <FeatureCard
          title="Monolithic Speed"
          description="Go-powered Gin server with NATS handlers for lightning-fast request processing."
          icon="⚡"
        />
        <FeatureCard
          title="Type-Safe DB"
          description="PostgreSQL integration with sqlc for compile-time safe database interactions."
          icon="🛡️"
        />
        <FeatureCard
          title="Docker Native"
          description="Full containerization for development and production environments out of the box."
          icon="🐳"
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-8 bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-3xl backdrop-blur-sm space-y-4 hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 group">
      <div className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-300">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

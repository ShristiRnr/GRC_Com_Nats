import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Home | grc-compil" },
    { name: "description", content: "Welcome to grc-compil - A modern React Router v7 application." },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          Welcome to <span className="text-blue-600">grc-compil</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          A high-performance, modern web application built with React Router v7 and Tailwind CSS v4.
        </p>
      </div>
      <div className="flex gap-4">
        <a href="/about" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
          Learn More
        </a>
        <a href="/contact" className="px-8 py-3 bg-gray-100 dark:bg-gray-800 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          Get in Touch
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-16 text-left">
        <FeatureCard title="Fast" description="Built on top of Vite for lightning-fast development and optimized production builds." />
        <FeatureCard title="Modern" description="Leveraging the latest features of React Router v7 and Tailwind CSS v4." />
        <FeatureCard title="Clean" description="Structured for scalability and maintainability with a focus on code quality." />
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl space-y-2 hover:border-blue-500/50 transition cursor-default">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

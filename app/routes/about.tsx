import type { Route } from "./+types/about";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "About | grc-compil" },
        { name: "description", content: "About grc-compil" },
    ];
}

export default function About() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <div className="max-w-2xl w-full space-y-8 text-center">
                <h1 className="text-5xl font-black tracking-tight">
                    Beyond <span className="text-blue-600">Standard</span> Boilerplates
                </h1>
                <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    <p>
                        grc-compil is designed for developers who value performance, scalability, and
                        clean architecture. We've combined the power of React Router v7 with a robust
                        Go backend to give you the perfect starting point.
                    </p>
                    <p>
                        Whether you're building a simple landing page or a complex enterprise dashboard,
                        our architecture ensures your code stays manageable as you grow.
                    </p>
                </div>
                <div className="pt-8">
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard label="Backend" value="Go + NATS" />
                        <StatCard label="Frontend" value="RRv7 + TW v4" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
            <div className="text-sm font-bold">{value}</div>
        </div>
    );
}

import type { Route } from "./+types/about";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "About | grc-compil" },
        { name: "description", content: "About grc-compil" },
    ];
}

export default function About() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <h1 className="text-4xl font-bold mb-4">About Us</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                This is a basic but complete frontend setup using React Router v7.
            </p>
        </div>
    );
}

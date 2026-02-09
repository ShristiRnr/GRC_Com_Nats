import type { Route } from "./+types/contact";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Contact | grc-compil" },
        { name: "description", content: "Contact grc-compil" },
    ];
}

export default function Contact() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <form className="w-full max-w-md space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input type="text" className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" placeholder="Your Name" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" placeholder="your@email.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" rows={4} placeholder="Your message..."></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
                    Send Message
                </button>
            </form>
        </div>
    );
}

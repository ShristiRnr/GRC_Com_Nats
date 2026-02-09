import type { Route } from "./+types/contact";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Contact | grc-compil" },
        { name: "description", content: "Contact grc-compil" },
    ];
}

export default function Contact() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl shadow-blue-500/5 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Let's Talk</h1>
                    <p className="text-gray-500 dark:text-gray-400">Have questions? We're here to help.</p>
                </div>
                <form className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Name</label>
                        <input
                            type="text"
                            className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                            placeholder="Elon Musk"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                            placeholder="elon@spacex.com"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Message</label>
                        <textarea
                            className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 min-h-[120px]"
                            placeholder="Tell us about your project..."
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95"
                    >
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    );
}

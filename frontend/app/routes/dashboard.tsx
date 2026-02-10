import { useRouteLoaderData } from "react-router";
import type { User } from "../lib/api";

export default function Dashboard() {
    // Access data from the parent "protected" layout
    const data = useRouteLoaderData("routes/protected.tsx") as { user: User } | undefined;

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading your profile...</p>
                </div>
            </div>
        );
    }

    const { user } = data;

    return (
        <div className="min-h-screen bg-muted p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight font-display mb-2">
                            Dashboard
                        </h1>
                        <p className="text-zinc-400 text-lg">
                            Welcome back, <span className="text-primary font-semibold">{user.username}</span>. Here's what's happening today.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-card border border-border px-4 py-2 rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {user.username[0].toUpperCase()}
                            </div>
                            <div className="text-sm font-medium text-zinc-300">
                                {user.role === 'super_admin' ? 'Administrator' : 'User'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Tasks', value: '12', color: 'blue' },
                        { label: 'Active Compliance', value: '85%', color: 'emerald' },
                        { label: 'Open Issues', value: '3', color: 'amber' },
                        { label: 'Pending Reviews', value: '5', color: 'indigo' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-zinc-500 text-sm font-medium mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Recent Activities</h2>
                            <button className="text-sm text-primary hover:underline font-medium">View All</button>
                        </div>
                        <div className="divide-y divide-border">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="p-6 hover:bg-muted/50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                            📊
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Compliance report updated</p>
                                            <p className="text-zinc-500 text-sm">2 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-zinc-400">Processed</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">System Status</h2>
                        <div className="space-y-6">
                            {[
                                { name: 'API Server', status: 'Healthy', color: 'emerald' },
                                { name: 'Database', status: 'Connected', color: 'emerald' },
                                { name: 'NATS Worker', status: 'Running', color: 'emerald' },
                                { name: 'Email Queue', status: 'Idle', color: 'zinc' },
                            ].map((s) => (
                                <div key={s.name} className="flex justify-between items-center">
                                    <span className="text-zinc-400 font-medium">{s.name}</span>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full bg-${s.color}-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]`}></div>
                                        <span className={`text-${s.color}-500 text-sm font-semibold`}>{s.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-border">
                            <button className="w-full bg-muted hover:bg-zinc-800 text-white font-semibold py-3 rounded-xl transition-colors border border-border">
                                System Logs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

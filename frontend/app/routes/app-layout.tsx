import { Outlet, useRouteLoaderData } from 'react-router'
import { Sidebar } from '~/components/layout/sidebar'
import { Header } from '~/components/layout/header'
import type { User } from '~/lib/api'

// User data is loaded by the parent protected.tsx layout.
// This layout is purely the UI shell (sidebar + header + content area).
export async function clientLoader() {
    // No auth checks needed here — protected.tsx handles that.
    // Return null so this layout's loader is satisfied.
    return null;
}

export default function AppLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}


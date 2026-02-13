import { useEffect, useState } from "react"
import { DashboardView } from "~/components/dashboard/dashboard-view"
import { getDashboardStats, type DashboardStats } from "~/lib/api/dashboard"
import { Loader2 } from "lucide-react"

export default function DashboardIndex() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await getDashboardStats()
                setStats(data)
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Failed to load dashboard data.
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your compliance posture.</p>
                </div>
            </div>

            <DashboardView stats={stats} />
        </div>
    )
}

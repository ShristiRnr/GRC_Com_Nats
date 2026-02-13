import { useEffect, useState } from "react"
import { ComplianceStatusView } from "~/components/dashboard/compliance-status-view"
import { getDashboardStats, type DashboardStats } from "~/lib/api/dashboard"
import { getFrameworks, type Framework } from "~/lib/api/frameworks"
import { Loader2 } from "lucide-react"

export default function ComplianceStatusPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [frameworks, setFrameworks] = useState<Framework[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const [s, f] = await Promise.all([getDashboardStats(), getFrameworks()])
                setStats(s)
                setFrameworks(f)
            } catch (error) {
                console.error("Failed to load compliance data", error)
            } finally {
                setLoading(false)
            }
        }
        load()
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
                Failed to load compliance data.
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Compliance Status</h2>
                <p className="text-muted-foreground">
                    Detailed breakdown of your organization's compliance posture.
                </p>
            </div>
            <ComplianceStatusView
                frameworks={frameworks}
                stats={stats.compliance_stats}
            />
        </div>
    )
}

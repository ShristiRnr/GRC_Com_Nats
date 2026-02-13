"use client"

import { useState } from "react"
import { useSearchParams, useRouteLoaderData } from "react-router"
import { RiskStats } from "~/components/risks/risk-stats"
import { RiskHeatmap } from "~/components/risks/risk-heatmap"
import { RiskTable } from "~/components/risks/risk-table"
import { Button } from "~/components/ui/button"
import { Plus } from "lucide-react"
import { useRisks } from "~/hooks/queries/use-risks"
import { Loader2 } from "lucide-react"
// import { CreateRiskDialog } from "~/components/risks/create-risk-dialog" // To be implemented

export default function RisksPage() {
    const [searchParams] = useSearchParams()
    const user = useRouteLoaderData("routes/protected") as { user: { org_id: string } } | null
    const orgId = user?.user?.org_id || "00000000-0000-0000-0000-000000000000"
    const { data, isLoading } = useRisks(orgId)
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    // Derived state or filters could go here
    const risks = data?.items || []

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Risk Register</h2>
                    <p className="text-muted-foreground">
                        Identify, assess, and manage risks to your organization's objectives.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Risk
                    </Button>
                </div>
            </div>

            <RiskStats orgId={orgId} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    {/* Placeholder for top risks or other charts if v1 has them */}
                </div>
                <div className="col-span-3">
                    <RiskHeatmap orgId={orgId} risks={risks} />
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <RiskTable risks={risks} />
                )}
            </div>

            {/* <CreateRiskDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} /> */}
        </div>
    )
}

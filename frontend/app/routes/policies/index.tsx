"use client"

import { useEffect, useState } from "react"
import { PolicyTable } from "~/components/policies/policy-table"
import { AddPolicyDialog } from "~/components/policies/add-policy-dialog"
import { getPolicies } from "~/lib/api/policies"
import type { Policy } from "~/lib/api/policies"
import { Loader2 } from "lucide-react"

export default function PoliciesPage() {
    const [policies, setPolicies] = useState<Policy[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchPolicies = async () => {
        try {
            const data = await getPolicies()
            setPolicies(data)
        } catch (error) {
            console.error("Failed to fetch policies", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPolicies()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Policy Management</h2>
                    <p className="text-muted-foreground text-sm">
                        Draft, review, and publish organizational policies.
                    </p>
                </div>
                <AddPolicyDialog onSuccess={fetchPolicies} />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <PolicyTable policies={policies} onRefresh={fetchPolicies} />
            )}
        </div>
    )
}

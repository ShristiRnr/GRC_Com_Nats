"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { MoreVertical, AlertTriangle } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { EmptyState } from "~/components/ui/empty-state"
import { useState } from "react"
// import { MitigationDialog } from "./mitigation-dialog" // To be implemented later
import type { Risk, RiskControl } from "~/lib/api/risks"
// import { deleteRisk } from "~/lib/api/risks" // To be used in handleDelete

export function RiskTable({ risks, controls = [] }: { risks: Risk[], controls?: any[] }) {
    const [mitigationRiskId, setMitigationRiskId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        // try {
        //   await deleteRisk(id)
        //   // toast.success('Risk deleted successfully')
        // } catch (error) {
        //   // toast.error('Failed to delete risk')
        // }
        console.log("Delete risk", id)
    }

    const getRiskLevel = (impact: number, likelihood: number) => {
        const score = impact * likelihood
        if (score >= 15) return { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' }
        if (score >= 10) return { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' }
        if (score >= 5) return { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' }
        return { label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' }
    }

    if (risks.length === 0) {
        return (
            <div className="rounded-md border bg-card p-12 shadow-sm flex justify-center">
                <EmptyState
                    icon={AlertTriangle}
                    title="No risks identified"
                    description="Your risk register is empty. Start by identifying potential risks to your organization."
                />
            </div>
        )
    }

    return (
        <div className="rounded-md border bg-card overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Risk Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead>Likelihood</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {risks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                No risks identified.
                            </TableCell>
                        </TableRow>
                    ) : (
                        risks.map((risk) => {
                            const level = getRiskLevel(risk.inherent_impact, risk.inherent_likelihood)
                            return (
                                <TableRow key={risk.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium text-foreground">
                                        {risk.title}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                                        {risk.description}
                                    </TableCell>
                                    <TableCell>{risk.inherent_impact}</TableCell>
                                    <TableCell>{risk.inherent_likelihood}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={level.color}>
                                            {level.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">
                                            {risk.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setMitigationRiskId(risk.id)}>
                                                    Mitigation Plan
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDelete(risk.id)}
                                                >
                                                    Delete Risk
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>

            {/* MitigationDialog placeholder */}
            {/* {mitigationRiskId && (
        <MitigationDialog
          riskId={mitigationRiskId}
          controls={controls}
          open={!!mitigationRiskId}
          onOpenChange={(open) => !open && setMitigationRiskId(null)}
        />
      )} */}
        </div>
    )
}

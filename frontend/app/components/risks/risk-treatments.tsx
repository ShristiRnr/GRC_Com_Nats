"use client"

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import type { Risk } from "~/lib/api/risks"
import { Badge } from "~/components/ui/badge"
import { ScrollArea } from "~/components/ui/scroll-area"

export function RiskTreatments({ risks }: { risks: Risk[] }) {
    const columns = [
        { id: 'mitigating', label: 'Mitigation in Progress', color: 'bg-blue-500' },
        { id: 'mitigated', label: 'Mitigated (Controls Active)', color: 'bg-green-500' },
        { id: 'accepted', label: 'Risk Accepted', color: 'bg-amber-500' },
        { id: 'transfer', label: 'Transferred', color: 'bg-purple-500' } // Assuming transfer exists or closed
    ]

    const getRisksByStatus = (status: string) => {
        return risks.filter(r => r.status === status)
    }

    return (
        <div className="flex h-[calc(100vh-300px)] gap-4 overflow-x-auto pb-4">
            {columns.map(col => (
                <div key={col.id} className="flex min-w-[300px] flex-col rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-center justify-between p-4 border-b border-border/50">
                        <h3 className="font-bold text-sm">{col.label}</h3>
                        <Badge variant="secondary" className="bg-background">
                            {getRisksByStatus(col.id).length}
                        </Badge>
                    </div>
                    <ScrollArea className="flex-1 p-3">
                        <div className="space-y-3">
                            {getRisksByStatus(col.id).map(risk => (
                                <Card key={risk.id} className="cursor-move hover:shadow-md transition-all">
                                    <CardHeader className="p-3 pb-2 space-y-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-sm font-medium leading-tight">
                                                {risk.title}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="text-[10px] h-5">
                                                Impact: {risk.inherent_impact}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] h-5">
                                                Prob: {risk.inherent_likelihood}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {getRisksByStatus(col.id).length === 0 && (
                                <div className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
                                    No risks in this stage
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            ))}
        </div>
    )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import type { Risk } from "~/lib/api/risks"

export function RiskHeatmap({ risks, orgId }: { risks: Risk[]; orgId?: string }) {
    // 5x5 grid
    const matrix = Array(5).fill(0).map(() => Array(5).fill(0))

    risks.forEach(risk => {
        // Indices are 0-based, scores are 1-5
        // Matrix rows are Impact (5 at top, 1 at bottom) -> index = 5 - impact
        // Matrix cols are Likelihood (1 at left, 5 at right) -> index = likelihood - 1
        if (risk.inherent_impact && risk.inherent_likelihood) {
            const row = 5 - risk.inherent_impact
            const col = risk.inherent_likelihood - 1
            if (row >= 0 && row < 5 && col >= 0 && col < 5) {
                matrix[row][col]++
            }
        }
    })

    const getCellColor = (row: number, col: number) => {
        // Impact (5-1), Likelihood (1-5)
        const impact = 5 - row
        const likelihood = col + 1
        const score = impact * likelihood

        if (score >= 15) return 'bg-red-500'
        if (score >= 10) return 'bg-orange-500'
        if (score >= 5) return 'bg-amber-400'
        return 'bg-green-400'
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Risk Heatmap</CardTitle>
                <CardDescription>Inherent risk distribution (Impact vs Likelihood)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex">
                    {/* Y-Axis Label */}
                    <div className="flex flex-col justify-center items-center w-8 mr-2">
                        <span className="-rotate-90 text-sm font-bold text-muted-foreground whitespace-nowrap">Impact</span>
                    </div>

                    <div className="flex-1">
                        <div className="grid grid-cols-5 gap-1 aspect-square">
                            {matrix.map((row, rowIndex) => (
                                row.map((count, colIndex) => (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        className={`relative flex items-center justify-center rounded-md text-white font-bold transition-all hover:opacity-90 cursor-default ${getCellColor(rowIndex, colIndex)}`}
                                        title={`Impact: ${5 - rowIndex}, Likelihood: ${colIndex + 1}`}
                                    >
                                        {count > 0 && <span>{count}</span>}
                                    </div>
                                ))
                            ))}
                        </div>
                        {/* X-Axis Label */}
                        <div className="text-center mt-2">
                            <span className="text-sm font-bold text-muted-foreground">Likelihood</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

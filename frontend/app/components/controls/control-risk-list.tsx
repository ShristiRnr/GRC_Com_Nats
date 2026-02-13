"use client"

import { useState } from "react"
import { type ControlRisk } from "~/lib/api/controls"
import { unlinkRiskFromControl } from "~/lib/api/risks"
import { Button } from "~/components/ui/button"
import { Download, AlertTriangle, Trash2, Activity, MoreVertical, Eye, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"
import { LinkRiskDialog } from "./link-risk-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

interface ControlRiskListProps {
    controlId: string
    risks: ControlRisk[]
    onSuccess: () => void
}

export function ControlRiskList({ controlId, risks, onSuccess }: ControlRiskListProps) {
    const [processing, setProcessing] = useState<string | null>(null)

    const handleUnlink = async (riskId: string) => {
        setProcessing(riskId)
        try {
            await unlinkRiskFromControl(riskId, controlId)
            toast.success("Risk unlinked successfully")
            onSuccess()
        } catch (error) {
            toast.error("Failed to unlink risk")
        } finally {
            setProcessing(null)
        }
    }

    const handleExport = () => {
        if (risks.length === 0) {
            toast.error("No data to export")
            return
        }

        const headers = ["ID", "Title", "Impact", "Likelihood", "Score", "Status"]
        const csvRows = [
            headers.join(","),
            ...risks.map(r => [
                `"${r.id}"`,
                `"${r.title}"`,
                r.inherent_impact,
                r.inherent_likelihood,
                r.inherent_impact * r.inherent_likelihood,
                `"${r.status}"`
            ].join(","))
        ]

        const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.setAttribute('hidden', '')
        a.setAttribute('href', url)
        a.setAttribute('download', `control-${controlId}-risks.csv`)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        toast.success("Risks exported successfully")
    }

    const getImpactBadge = (score: number) => {
        if (score >= 15) return <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none text-[9px] font-black uppercase h-5">Critical</Badge>
        if (score >= 9) return <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none text-[9px] font-black uppercase h-5">High</Badge>
        if (score >= 4) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none text-[9px] font-black uppercase h-5">Medium</Badge>
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none text-[9px] font-black uppercase h-5">Low</Badge>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <LinkRiskDialog controlId={controlId} onSuccess={onSuccess} />
                <Button variant="outline" size="sm" className="font-bold h-8 text-[11px] uppercase tracking-wider" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm shadow-slate-200/50">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 py-4">Threat Interface</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/80">Inherent Risk</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/80">Effectiveness</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/80">Workflow</TableHead>
                            <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 pr-6 uppercase">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {risks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic font-medium">
                                    No vulnerabilities mapped to this control.
                                </TableCell>
                            </TableRow>
                        ) : (
                            risks.map((risk) => (
                                <TableRow key={risk.id} className="group border-border hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 group-hover:scale-110 transition-transform">
                                                <AlertTriangle className="size-4" />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                                    {risk.title}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter truncate max-w-[200px]">
                                                    {risk.description || 'Securiy vulnerability'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black tabular-nums">{risk.inherent_impact * risk.inherent_likelihood}</span>
                                            {getImpactBadge(risk.inherent_impact * risk.inherent_likelihood)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-bold text-[10px] uppercase bg-slate-100 dark:bg-slate-800 border-border/60">
                                            {risk.effectiveness || 'Untested'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className="capitalize shadow-none px-2 py-0 h-5 text-[10px] font-bold bg-slate-900 text-white border-none"
                                        >
                                            {risk.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[180px] p-1 shadow-xl border-border">
                                                <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/5 font-bold text-xs uppercase tracking-tighter">
                                                    <Eye className="size-3.5 text-muted-foreground" />
                                                    View Hazard
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/5 font-bold text-xs uppercase tracking-tighter">
                                                    <ShieldAlert className="size-3.5 text-muted-foreground" />
                                                    Mitigation Strategy
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-white focus:bg-destructive gap-2 cursor-pointer font-bold text-xs uppercase tracking-tighter"
                                                    disabled={processing === risk.id}
                                                    onClick={() => handleUnlink(risk.id)}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                    Unmap Risk
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

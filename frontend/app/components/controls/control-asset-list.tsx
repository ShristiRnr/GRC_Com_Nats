"use client"

import { useState } from "react"
import { type ControlAsset, type ControlRisk } from "~/lib/api/controls"
import { unlinkAssetFromControl } from "~/lib/api/assets"
import { Button } from "~/components/ui/button"
import { Download, Server, Trash2, Shield, Activity, MoreVertical, Eye } from "lucide-react"
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
import { LinkAssetDialog } from "./link-asset-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

interface ControlAssetListProps {
    controlId: string
    assets: ControlAsset[]
    onSuccess: () => void
}

export function ControlAssetList({ controlId, assets, onSuccess }: ControlAssetListProps) {
    const [processing, setProcessing] = useState<string | null>(null)

    const handleUnlink = async (assetId: string) => {
        setProcessing(assetId)
        try {
            await unlinkAssetFromControl(assetId, controlId)
            toast.success("Asset unlinked successfully")
            onSuccess()
        } catch (error) {
            toast.error("Failed to unlink asset")
        } finally {
            setProcessing(null)
        }
    }

    const handleExport = () => {
        if (assets.length === 0) {
            toast.error("No data to export")
            return
        }

        const headers = ["ID", "Name", "Type", "Criticality", "Status", "Coverage Status"]
        const csvRows = [
            headers.join(","),
            ...assets.map(a => [
                `"${a.id}"`,
                `"${a.name}"`,
                `"${a.type}"`,
                `"${a.criticality}"`,
                `"${a.status}"`,
                `"${a.coverage_status || ""}"`
            ].join(","))
        ]

        const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.setAttribute('hidden', '')
        a.setAttribute('href', url)
        a.setAttribute('download', `control-${controlId}-assets.csv`)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        toast.success("Assets exported successfully")
    }

    const getCriticalityColor = (criticality: string) => {
        switch (criticality.toLowerCase()) {
            case 'critical': return "bg-rose-500 hover:bg-rose-600 text-white"
            case 'high': return "bg-orange-500 hover:bg-orange-600 text-white"
            case 'medium': return "bg-yellow-500 hover:bg-yellow-600 text-white"
            default: return "bg-emerald-500 hover:bg-emerald-600 text-white"
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <LinkAssetDialog controlId={controlId} onSuccess={onSuccess} />
                <Button variant="outline" size="sm" className="font-bold h-8 text-[11px] uppercase tracking-wider" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm shadow-slate-200/50">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 py-4">Asset Detail</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/80">Criticality</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/80">Coverage</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/80">Status</TableHead>
                            <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 pr-6 uppercase">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic font-medium">
                                    No infrastructure associated with this control.
                                </TableCell>
                            </TableRow>
                        ) : (
                            assets.map((asset) => (
                                <TableRow key={asset.id} className="group border-border hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform">
                                                <Server className="size-4" />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                                    {asset.name}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                                    {asset.type}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`shadow-none px-2 py-0 text-[9px] font-black uppercase border-none h-5 ${getCriticalityColor(asset.criticality)}`}>
                                            {asset.criticality}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-bold text-[10px] uppercase bg-slate-100 dark:bg-slate-800 border-border/60">
                                                {asset.coverage_status || 'Implementing'}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`capitalize shadow-none px-2 py-0 h-5 text-[10px] font-bold ${asset.status === 'active'
                                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-none'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-100 border-border'
                                                }`}
                                        >
                                            {asset.status}
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
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/5 font-bold text-xs uppercase tracking-tighter">
                                                    <Activity className="size-3.5 text-muted-foreground" />
                                                    Audit Trail
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-white focus:bg-destructive gap-2 cursor-pointer font-bold text-xs uppercase tracking-tighter"
                                                    disabled={processing === asset.id}
                                                    onClick={() => handleUnlink(asset.id)}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                    Unlink Asset
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

"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, Download, Upload, Filter, Search, Plus, Info } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { getControls, getControlStats, type Control, type ControlStats } from "~/lib/api/controls"
import { ControlsDataTable } from "~/components/controls/data-table/data-table"
import { getColumns } from "~/components/controls/data-table/columns"
import { ControlsStats } from "~/components/controls/controls-stats"
import { ControlViews } from "~/components/controls/control-views"
import { AddControlDialog } from "~/components/controls/add-control-dialog"
import { ControlImportDialog } from "~/components/controls/control-import-dialog"
import { toast } from "sonner"
import { Badge } from "~/components/ui/badge"

export default function ControlsPage() {
    const [controls, setControls] = useState<Control[]>([])
    const [stats, setStats] = useState<ControlStats | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [controlsData, statsData] = await Promise.all([
                getControls(),
                getControlStats()
            ])
            setControls(controlsData)
            setStats(statsData)
        } catch (error) {
            toast.error("Failed to refresh controls data")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleExport = () => {
        if (controls.length === 0) {
            toast.error("No data to export")
            return
        }

        const headers = ["Code", "Title", "Description", "Category", "Frameworks", "Status"]
        const csvRows = [
            headers.join(","),
            ...controls.map(c => [
                `"${c.code}"`,
                `"${c.title}"`,
                `"${c.description || ""}"`,
                `"${c.category || ""}"`,
                `"${(c.frameworks || []).map(f => f.name).join("; ")}"`,
                `"${c.status || "active"}"`
            ].join(","))
        ]

        const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.setAttribute('hidden', '')
        a.setAttribute('href', url)
        a.setAttribute('download', 'controls_export.csv')
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        toast.success("Controls exported successfully")
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                            <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-foreground">Controls Library</h2>
                    </div>
                    <p className="text-muted-foreground font-medium text-sm ml-11">
                        Comprehensive repository of organizational compliance controls.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 font-bold shadow-sm border-border/60 hover:bg-white dark:hover:bg-slate-900 transition-all"
                        onClick={handleExport}
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export
                    </Button>
                    <ControlImportDialog onSuccess={fetchData} />
                    <AddControlDialog onSuccess={fetchData} />
                </div>
            </div>

            {stats && (
                <ControlsStats
                    totalControls={stats.total_controls}
                    activeControls={stats.active_controls}
                    draftControls={stats.draft_controls}
                    mappedControls={stats.mapped_controls}
                    uniqueCategories={stats.unique_categories}
                />
            )}

            <ControlViews controls={controls} onSuccess={fetchData} />
        </div>
    )
}

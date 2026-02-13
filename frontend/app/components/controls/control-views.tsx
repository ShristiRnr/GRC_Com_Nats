"use client"

import { useState } from "react"
import type { Control } from "~/lib/api/controls"
import { ControlsDataTable } from "./data-table/data-table"
import { getColumns } from "./data-table/columns"
import { ControlHierarchy } from "./control-hierarchy"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { LayoutList, ListTree, Info } from "lucide-react"
import { Card } from "~/components/ui/card"

interface ControlViewsProps {
    controls: Control[]
    onSuccess: () => void
}

export function ControlViews({ controls, onSuccess }: ControlViewsProps) {
    const [viewMode, setViewMode] = useState<"list" | "hierarchy">("list")
    const columns = getColumns({ onSuccess })

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-end border-b border-border/50 pb-4">
                <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(value: string) => value && setViewMode(value as "list" | "hierarchy")}
                    className="bg-muted/30 p-1 rounded-lg border border-border/50"
                >
                    <ToggleGroupItem value="list" aria-label="List View" className="h-8 px-3 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-primary transition-all">
                        <LayoutList className="h-4 w-4 mr-2" />
                        <span className="text-xs font-semibold">List</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="hierarchy" aria-label="Hierarchy View" className="h-8 px-3 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-primary transition-all">
                        <ListTree className="h-4 w-4 mr-2" />
                        <span className="text-xs font-semibold">Hierarchy</span>
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {viewMode === "list" ? (
                <Card className="shadow-md border-border bg-card overflow-hidden">
                    <div className="p-1 border-b bg-muted/30 flex items-center gap-2 px-4 py-2">
                        <Info className="size-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Master Control List</span>
                    </div>
                    <div className="p-6">
                        <ControlsDataTable columns={columns} data={controls} />
                    </div>
                </Card>
            ) : (
                <ControlHierarchy controls={controls} />
            )}
        </div>
    )
}

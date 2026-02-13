"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Framework } from "~/lib/api/frameworks"
import { Badge } from "~/components/ui/badge"
import { Checkbox } from "~/components/ui/checkbox"
import { Button } from "~/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import { Link } from "react-router"
import { EditFrameworkDialog } from "~/components/frameworks/edit-framework-dialog"
import { DeleteFrameworkDialog } from "~/components/frameworks/delete-framework-dialog"
import { PublishFrameworkButton } from "~/components/frameworks/publish-framework-button"

export const columns: ColumnDef<Framework>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Framework
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const name = row.getValue("name") as string
            const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()

            return (
                <div className="flex items-center gap-3 py-1">
                    <Avatar className="h-9 w-9 rounded-lg border bg-secondary">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <Link
                            to={`/frameworks/${row.original.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                            {name}
                        </Link>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={row.original.description || ''}>
                            {row.original.description || "No description"}
                        </span>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "version",
        header: "Version",
        cell: ({ row }) => (
            <Badge variant="outline" className="font-mono text-[10px]">
                {row.getValue("version") || "v1.0"}
            </Badge>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge
                    variant={status === 'published' ? 'default' : status === 'archived' ? 'destructive' : 'secondary'}
                    className={`capitalize shadow-none ${status === 'published' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : status === 'archived' ? 'bg-muted text-muted-foreground hover:bg-muted/80' : ''}`}
                >
                    {status || 'draft'}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "control_count",
        header: ({ column }) => {
            return (
                <div className="flex justify-center w-full">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Controls
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Badge variant="secondary" className="font-mono text-xs w-8 justify-center">
                    {row.getValue("control_count")}
                </Badge>
            </div>
        ),
    },
    {
        accessorKey: "progress",
        header: "Adherence",
        cell: ({ row }) => {
            const progress = row.getValue("progress") as number
            // Semantic colors for adherence
            const colorClass = progress >= 80 ? 'bg-emerald-500' : progress >= 50 ? 'bg-amber-500' : 'bg-red-500'

            return (
                <div className="flex items-center gap-2 w-[140px]">
                    <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${colorClass}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium w-[3ch]">{progress}%</span>
                </div>
            )
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            return (
                <div className="flex items-center justify-end gap-2 text-right">
                    <PublishFrameworkButton framework={row.original} />
                    <EditFrameworkDialog framework={row.original} />
                    <DeleteFrameworkDialog framework={row.original} />
                </div>
            )
        },
    },
]

"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Control } from "~/lib/api/controls"
import { Badge } from "~/components/ui/badge"
import { Checkbox } from "~/components/ui/checkbox"
import { Button } from "~/components/ui/button"
import {
    MoreHorizontal,
    ArrowUpDown,
    ShieldCheck,
    AlertTriangle,
    CheckCircle,
    XCircle,
    MinusCircle,
    LayoutList,
    Pencil,
    Trash2,
    Server,
    User as UserIcon,
    History
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "~/components/ui/dropdown-menu"
import { Link } from "react-router"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip"
import { toast } from "sonner"
import { deleteControl } from "~/lib/api/controls"
import { useState } from "react"
import { DeleteControlDialog } from "~/components/controls/delete-control-dialog"

// Action wrapper component
const ControlActions = ({ control, onSuccess }: { control: Control; onSuccess: () => void }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/5 hover:text-primary transition-colors">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px] p-1 shadow-lg border-border/50 animate-in fade-in zoom-in-95 duration-100">
                    <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link to={`/controls/${control.id}`} className="flex items-center cursor-pointer">
                            <LayoutList className="mr-2 h-3.5 w-3.5" />
                            <span className="text-xs font-medium">View Details</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link to={`/controls/${control.id}?edit=true`} className="flex items-center cursor-pointer text-primary focus:text-primary focus:bg-primary/5">
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Edit Control</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="flex items-center text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer"
                        onSelect={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        <span className="text-xs font-bold">Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteControlDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                controlId={control.id}
                controlCode={control.code}
                onSuccess={onSuccess}
            />
        </>
    )
}

export const getColumns = ({ onSuccess }: { onSuccess: () => void }): ColumnDef<Control>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "code",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="px-0 hover:bg-transparent text-xs font-bold uppercase tracking-wider"
                >
                    Code
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-mono text-[11px] font-black bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/10 w-fit">
                {row.getValue("code")}
            </div>
        ),
    },
    {
        accessorKey: "title",
        header: ({ column }) => (
            <span className="text-xs font-bold uppercase tracking-wider">Control Description</span>
        ),
        cell: ({ row }) => {
            return (
                <div className="flex flex-col max-w-[320px] gap-0.5">
                    <Link
                        to={`/controls/${row.original.id}`}
                        className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate"
                    >
                        {row.getValue("title")}
                    </Link>
                    <span className="text-[11px] text-muted-foreground font-medium line-clamp-1 italic" title={row.original.description || ''}>
                        {row.original.description || "No specific guidance provided"}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "category",
        header: ({ column }) => (
            <span className="text-xs font-bold uppercase tracking-wider">Category</span>
        ),
        cell: ({ row }) => {
            const category = row.getValue("category") as string
            return category ? (
                <Badge variant="outline" className="text-[10px] font-bold bg-muted/30 border-border/50 text-muted-foreground px-2 py-0 h-5">
                    {category}
                </Badge>
            ) : (
                <span className="text-[11px] text-muted-foreground font-medium opacity-50">—</span>
            )
        },
    },
    {
        accessorKey: "frameworks",
        header: ({ column }) => (
            <span className="text-xs font-bold uppercase tracking-wider">Frameworks</span>
        ),
        cell: ({ row }) => {
            const frameworks = row.original.frameworks || []
            return (
                <div className="flex flex-wrap gap-1 max-w-[160px]">
                    {frameworks.length > 0 ? (
                        <>
                            {frameworks.slice(0, 1).map((fw, i) => (
                                <Badge key={i} variant="secondary" className="text-[9px] font-black uppercase tracking-tighter px-1.5 h-4.5 bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 transition-colors">
                                    {fw.name}
                                </Badge>
                            ))}
                            {frameworks.length > 1 && (
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Badge variant="outline" className="text-[9px] font-black px-1.5 h-4.5 cursor-help border-dashed bg-white border-border/60">
                                                +{frameworks.length - 1} more
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="p-2 shadow-xl border-border bg-popover">
                                            <div className="flex flex-col gap-1.5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-1 mb-1">Mapped Frameworks</p>
                                                {frameworks.slice(1).map((fw, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <ShieldCheck className="size-3 text-indigo-500" />
                                                        <span className="text-[11px] font-bold text-foreground">{fw.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </>
                    ) : (
                        <Badge variant="outline" className="text-[9px] font-black px-1.5 h-4.5 border-dashed border-destructive/20 text-destructive/60 bg-white">
                            Unmapped
                        </Badge>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "compliance_status",
        header: ({ column }) => (
            <span className="text-xs font-bold uppercase tracking-wider">Compliance</span>
        ),
        cell: ({ row }) => {
            const status = row.original.status || "not_assessed"

            // Replicating v1 colors and badges
            const config = {
                compliant: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Compliant" },
                partial: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle, label: "Partial" },
                non_compliant: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle, label: "Failed" },
                not_applicable: { color: "bg-slate-50 text-slate-500 border-slate-200", icon: MinusCircle, label: "N/A" },
                not_assessed: { color: "bg-muted/30 text-muted-foreground border-border/50", icon: History, label: "Not Assessed" }
            }

            const activeStatus = (row.original as any).compliance_status || 'not_assessed'
            const { color, icon: Icon, label } = (config as any)[activeStatus] || config.not_assessed

            return (
                <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 h-5 gap-1 shadow-sm transition-all ${color}`}>
                    <Icon className="h-3 w-3" />
                    <span>{label}</span>
                </Badge>
            )
        }
    },
    {
        accessorKey: "owner",
        header: ({ column }) => (
            <span className="text-xs font-bold uppercase tracking-wider">Owner</span>
        ),
        cell: ({ row }) => {
            const owner = row.original.owner
            return (
                <div className="flex items-center gap-2.5 group">
                    <Avatar className="h-7 w-7 border border-border/50 group-hover:border-primary/30 transition-all shadow-xs">
                        <AvatarImage src={owner?.avatar_url || undefined} />
                        <AvatarFallback className="text-[9px] font-black bg-primary/5 text-primary">
                            {owner?.full_name?.[0] || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-foreground leading-none">
                            {owner?.full_name || 'Unassigned'}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-medium">Responsibility</span>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <span className="text-xs font-bold uppercase tracking-wider">Status</span>
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge
                    variant={status === 'active' ? 'default' : 'secondary'}
                    className={`text-[9px] font-black uppercase tracking-widest px-2 h-4.5 border shadow-xs transition-all ${status === 'active'
                        ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
                        : 'bg-muted text-muted-foreground border-border/50'
                        }`}
                >
                    {status}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <ControlActions control={row.original} onSuccess={onSuccess} />,
    },
]

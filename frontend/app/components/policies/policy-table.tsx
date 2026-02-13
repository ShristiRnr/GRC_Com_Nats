"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { FileText, MoreVertical, Eye } from "lucide-react"
import { Link } from "react-router"
import type { Policy } from "~/lib/api/policies"
import { deletePolicy } from "~/lib/api/policies"
import { EmptyState } from "~/components/ui/empty-state"
import { toast } from "sonner"

interface PolicyTableProps {
    policies: Policy[]
    onRefresh?: () => void
}

function formatDate(dateStr: string | undefined | null): string {
    if (!dateStr) return "—"
    try {
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return "—"
        return d.toLocaleDateString()
    } catch {
        return "—"
    }
}

export function PolicyTable({ policies, onRefresh }: PolicyTableProps) {

    const handleDelete = async (id: string) => {
        try {
            await deletePolicy(id)
            toast.success('Policy deleted successfully')
            if (onRefresh) onRefresh()
        } catch (error) {
            toast.error('Failed to delete policy')
        }
    }

    if (policies.length === 0) {
        return (
            <div className="rounded-md border bg-card p-12 shadow-sm flex justify-center">
                <EmptyState
                    icon={FileText}
                    title="No policies found"
                    description="Create your first policy to get started with compliance documentation."
                />
            </div>
        )
    }

    return (
        <div className="rounded-md border bg-card overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Policy Name</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Reviewed</TableHead>
                        <TableHead>Next Review</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {policies.map((policy) => (
                        <TableRow key={policy.id} className="hover:bg-muted/50">
                            <TableCell>
                                <Link to={`/policies/${policy.id}`} className="flex items-center gap-3 group">
                                    <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors dark:bg-blue-900/30 dark:text-blue-400">
                                        <FileText className="size-4" />
                                    </div>
                                    <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                                        {policy.title}
                                    </div>
                                </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {policy.version || "—"}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={
                                        policy.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300'
                                            : 'bg-muted text-muted-foreground hover:bg-muted'
                                    }
                                >
                                    {policy.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {formatDate(policy.last_reviewed)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {formatDate(policy.next_review)}
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
                                        <DropdownMenuItem asChild>
                                            <Link to={`/policies/${policy.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Document
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Edit Policy</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleDelete(policy.id)}
                                        >
                                            Delete Policy
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

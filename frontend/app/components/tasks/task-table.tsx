"use client"
import { useState } from "react"
import { useNavigate } from "react-router"

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
    DropdownMenuLabel,
} from "~/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import { CheckSquare, MoreVertical, Eye, FileUp, Shield, Clock, Briefcase, Calendar, AlertTriangle, RotateCcw } from "lucide-react"
import type { Task } from "~/lib/api/tasks"
import { format, isPast, isWithinInterval, addDays } from "date-fns"
import { EvidenceDialog } from "./evidence-dialog"
import { cn } from "~/lib/utils"

interface TaskTableProps {
    tasks: Task[]
    onSuccess: () => void
    view?: 'owner' | 'reviewer' | 'assessor' | 'admin'
}

export function TaskTable({ tasks, onSuccess, view = 'owner' }: TaskTableProps) {
    const navigate = useNavigate()
    const [evidenceTaskId, setEvidenceTaskId] = useState<string | null>(null)

    const getStatusBadge = (status: string, result?: string | null) => {
        const base = "px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border-none ring-1 ring-inset"

        switch (status) {
            case 'completed':
                return <Badge className={cn(base, "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20")}>Completed</Badge>
            case 'approved':
                return <Badge className={cn(base, "bg-blue-500/10 text-blue-600 ring-blue-500/20")}>Approved</Badge>
            case 'in_assessment':
                return <Badge className={cn(base, "bg-violet-500/10 text-violet-600 ring-violet-500/20")}>Assessing</Badge>
            case 'in_review':
                return <Badge className={cn(base, "bg-indigo-500/10 text-indigo-600 ring-indigo-500/20")}>In Review</Badge>
            case 'submitted':
                return <Badge className={cn(base, "bg-amber-500/10 text-amber-600 ring-amber-500/20")}>Submitted</Badge>
            case 'refer_back':
                return <Badge className={cn(base, "bg-rose-500/10 text-rose-600 ring-rose-500/20")}>Returned</Badge>
            default:
                return <Badge className={cn(base, "bg-slate-500/10 text-slate-600 ring-slate-500/20")}>To Do</Badge>
        }
    }

    const getDueDateDisplay = (dateStr?: string | null) => {
        if (!dateStr) return <span className="text-muted-foreground opacity-40">—</span>
        const date = new Date(dateStr)
        const overdue = isPast(date) && !['completed', 'approved'].includes('') // Simplified check

        return (
            <div className={cn("flex items-center gap-1.5 font-bold tabular-nums", overdue ? "text-rose-500" : "text-foreground/70")}>
                <Calendar className="size-3.5 opacity-60" />
                <span>{format(date, "MMM d, yyyy")}</span>
            </div>
        )
    }

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-card/30 rounded-3xl border border-dashed border-border/60 text-center animate-in fade-in duration-500">
                <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6 shadow-inner">
                    <CheckSquare className="size-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-2">Inbox is Clear</h3>
                <p className="text-muted-foreground max-w-sm text-sm font-medium">
                    No tasks require your immediate attention. Time for a coffee break?
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 py-4 h-12">Task / Control</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 py-4 h-12 text-center">Status</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 py-4 h-12">Due Date</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 py-4 h-12">
                            {view === 'reviewer' ? 'Assignee' : 'Reviewer'}
                        </TableHead>
                        <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 py-4 h-12 pr-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TableRow
                            key={task.id}
                            className="group border-border/50 hover:bg-muted/30 transition-all cursor-pointer"
                            onClick={() => navigate(`/tasks/${task.id}`)}
                        >
                            <TableCell className="py-5">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shadow-sm border border-primary/10 transition-transform group-hover:scale-110">
                                        <CheckSquare className="size-5" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="font-black text-foreground text-sm uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                                            {task.title}
                                        </span>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-tighter opacity-70">
                                            <Briefcase className="size-3" />
                                            <span>{task.program?.name || "Global Framework"}</span>
                                            <span className="opacity-30">•</span>
                                            <span className="bg-muted rounded px-1.5">{task.control?.code || "C-STD"}</span>
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                {getStatusBadge(task.status, task.result)}
                            </TableCell>
                            <TableCell className="text-xs">
                                {getDueDateDisplay(task.due_date)}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2.5">
                                    <Avatar className="size-7 border border-white/20 shadow-sm ring-1 ring-primary/5">
                                        <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
                                            {(view === 'reviewer' ? task.owner?.full_name : task.reviewer?.full_name)?.[0] || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-foreground truncate">
                                            {(view === 'reviewer' ? task.owner?.full_name : task.reviewer?.full_name) || "Unassigned"}
                                        </span>
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
                                            {view === 'reviewer' ? 'Owner' : 'Reviewer'}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-muted/70 rounded-full transition-colors">
                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[220px] p-2 shadow-2xl border-border/50 bg-card/95 backdrop-blur-md">
                                        <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground/40 px-2 py-2">Workflow Actions</DropdownMenuLabel>
                                        <DropdownMenuItem className="rounded-lg cursor-pointer gap-3 px-3 py-2.5 focus:bg-primary/10 focus:text-primary transition-colors">
                                            <Eye className="size-4 shrink-0" />
                                            <span className="font-bold text-sm">Execution View</span>
                                        </DropdownMenuItem>
                                        {task.status === 'todo' && (
                                            <DropdownMenuItem
                                                className="rounded-lg cursor-pointer gap-3 px-3 py-2.5 bg-primary/5 text-primary focus:bg-primary focus:text-white transition-all shadow-sm group/btn"
                                                onClick={() => setEvidenceTaskId(task.id)}
                                            >
                                                <FileUp className="size-4 shrink-0 transition-transform group-hover/btn:-translate-y-0.5" />
                                                <span className="font-black text-sm">Upload Evidence</span>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator className="my-2 bg-border/20" />
                                        <DropdownMenuItem className="rounded-lg cursor-pointer gap-3 px-3 py-2.5 focus:bg-muted transition-colors">
                                            <Shield className="size-4 shrink-0" />
                                            <span className="font-bold text-sm">Control Standards</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <EvidenceDialog
                taskId={evidenceTaskId}
                open={!!evidenceTaskId}
                onOpenChange={(open) => !open && setEvidenceTaskId(null)}
                onSuccess={onSuccess}
            />
        </div>
    )
}

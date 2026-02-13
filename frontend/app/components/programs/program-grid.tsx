'use client'

import { useState } from 'react'
import { Card } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Progress } from '~/components/ui/progress'
import { Button } from '~/components/ui/button'
import {
    Briefcase,
    Plus,
    MoreVertical,
    ShieldAlert,
    CheckCircle2,
    LayoutGrid,
    Loader2
} from 'lucide-react'
import { Link } from 'react-router'
import type { Program } from '~/lib/api/programs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { deleteProgram } from '~/lib/api/programs'
import { toast } from 'sonner'
import { cn } from '~/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"

interface ProgramGridProps {
    programs: Program[]
    onDelete?: () => void
}

export function ProgramGrid({ programs, onDelete }: ProgramGridProps) {
    const [programToDelete, setProgramToDelete] = useState<{ id: string; name: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!programToDelete) return
        setIsDeleting(true)
        try {
            await deleteProgram(programToDelete.id)
            toast.success('Program deleted successfully')
            setProgramToDelete(null)
            onDelete?.()
        } catch (error) {
            toast.error('Failed to delete program')
        } finally {
            setIsDeleting(false)
        }
    }

    const getInitials = (name: string | null) => {
        if (!name) return '??'
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    if (programs.length === 0) {
        return (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl bg-card">
                <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-6 text-muted-foreground">
                    <Briefcase className="size-8" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">No Active Programs</h3>
                <p className="text-muted-foreground max-w-sm mt-2 mb-8">
                    Start a new audit cycle by creating your first program.
                </p>
                <Link to="/programs/new">
                    <Button size="lg" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Program
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => {
                    const isOverdue = program.daysLeft ? program.daysLeft < 0 : false;
                    const daysLeftText = program.daysLeft
                        ? (program.daysLeft < 0 ? `${Math.abs(program.daysLeft)} days overdue` : `${program.daysLeft} days left`)
                        : 'No due date';

                    // Status-driven color system
                    const statusConfig: any = {
                        planning: {
                            badge: "text-blue-700 border-blue-300 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800",
                            border: "border-l-blue-500",
                            progress: "bg-blue-500",
                            avatarBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
                        },
                        completed: {
                            badge: "text-emerald-700 border-emerald-300 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800",
                            border: "border-l-emerald-500",
                            progress: "bg-emerald-500",
                            avatarBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
                        },
                        active: {
                            badge: "text-emerald-700 border-emerald-300 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800",
                            border: "border-l-emerald-500",
                            progress: "bg-emerald-500",
                            avatarBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
                        },
                        paused: {
                            badge: "text-amber-700 border-amber-300 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800",
                            border: "border-l-amber-500",
                            progress: "bg-amber-500",
                            avatarBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
                        },
                        closed: {
                            badge: "text-slate-600 border-slate-300 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/40 dark:border-slate-700",
                            border: "border-l-slate-400",
                            progress: "bg-slate-500",
                            avatarBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
                        },
                    }[program.status] || {
                        badge: "text-muted-foreground border-border bg-muted",
                        border: "border-l-slate-300",
                        progress: "bg-slate-400",
                        avatarBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
                    };

                    // Framework tag color rotation
                    const fwColors = [
                        "text-teal-700 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/30",
                        "text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30",
                        "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30",
                        "text-cyan-700 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950/30",
                    ];

                    // Progress color by value (independent of status)
                    const progressColor =
                        program.progress >= 75 ? "bg-emerald-500" :
                            program.progress >= 50 ? "bg-blue-500" :
                                program.progress >= 25 ? "bg-amber-500" :
                                    "bg-red-400";

                    return (
                        <Link to={`/programs/${program.id}`} key={program.id} className="block group h-full">
                            <Card className={cn(
                                "flex flex-col h-full p-0 bg-card border border-border/60 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/30",
                                "border-l-[3px]", statusConfig.border
                            )}>
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-1.5">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-semibold text-foreground leading-snug truncate group-hover:text-primary transition-colors">
                                            {program.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-xs text-muted-foreground capitalize">
                                                {program.type?.replace('_', ' ') || 'Internal Audit'}
                                            </span>
                                            {program.end_date && (
                                                <>
                                                    <span className="text-border">·</span>
                                                    <span className={cn(
                                                        "text-xs",
                                                        isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
                                                    )}>
                                                        {daysLeftText}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Badge variant="outline" className={cn("text-[11px] uppercase font-semibold tracking-wide px-2 py-0.5 h-auto rounded-md border", statusConfig.badge)}>
                                            {program.status}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground -mr-1"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>Edit Scope</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setProgramToDelete({ id: program.id, name: program.name });
                                                }}>
                                                    Delete Program
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="px-4 pb-3 flex-1 flex flex-col gap-3">
                                    {/* Frameworks */}
                                    {program.frameworks && program.frameworks.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {program.frameworks.slice(0, 4).map((f: any, idx: number) => (
                                                <span key={f.id} className={cn("inline-flex items-center text-xs font-medium px-2 py-0.5 rounded", fwColors[idx % fwColors.length])}>
                                                    {f.name}
                                                </span>
                                            ))}
                                            {program.frameworks.length > 4 && (
                                                <span className="inline-flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded">
                                                    +{program.frameworks.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Assessor + Progress */}
                                    <div className="flex items-center justify-between gap-3 mt-auto">
                                        <div className="min-w-0">
                                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Assessor</p>
                                            {program.assessor ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6 border border-border/60">
                                                        <AvatarImage src={program.assessor.avatar_url || undefined} />
                                                        <AvatarFallback className={cn("text-[10px] font-semibold", statusConfig.avatarBg)}>{getInitials(program.assessor.full_name)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium text-foreground truncate max-w-[130px]">
                                                        {program.assessor.full_name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">—</span>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0 w-[120px]">
                                            <span className="text-xs font-semibold tabular-nums text-foreground">{program.progress}%</span>
                                            <span className="text-xs text-muted-foreground ml-0.5">done</span>
                                            <Progress
                                                value={program.progress}
                                                className="h-1.5 mt-1 bg-slate-200 ring-1 ring-slate-200/60 dark:bg-slate-700 dark:ring-slate-700/60 rounded-full"
                                                indicatorClassName={cn("rounded-full", progressColor)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Stats */}
                                <div className="grid grid-cols-3 border-t border-border/50 bg-slate-50/60 dark:bg-slate-900/30">
                                    <div className="flex items-center justify-center gap-1.5 py-2.5">
                                        <LayoutGrid className="size-4 text-blue-500 dark:text-blue-400" />
                                        <span className="text-sm font-semibold tabular-nums text-foreground">{program.stats?.controlCount || 0}</span>
                                        <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Controls</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 py-2.5 border-x border-border/50">
                                        <ShieldAlert className="size-4 text-amber-500 dark:text-amber-400" />
                                        <span className={cn("text-sm font-semibold tabular-nums", (program.stats?.riskCount || 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>
                                            {program.stats?.riskCount || 0}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Risks</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 py-2.5">
                                        <CheckCircle2 className="size-4 text-emerald-500 dark:text-emerald-400" />
                                        <span className="text-sm font-semibold tabular-nums text-foreground">{program.stats?.completedTasks || 0}<span className="text-muted-foreground font-normal">/</span>{program.stats?.totalTasks || 0}</span>
                                        <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Tasks</span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!programToDelete} onOpenChange={(open) => { if (!open && !isDeleting) setProgramToDelete(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Program</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{programToDelete?.name}"</span>? This will permanently remove the program, all associated tasks, evidence, and audit data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleDelete(); }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                        >
                            {isDeleting && <Loader2 className="size-4 animate-spin" />}
                            {isDeleting ? 'Deleting...' : 'Delete Program'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

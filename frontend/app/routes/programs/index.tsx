import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Plus, Users, Activity, BarChart3, CheckCircle2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'
import { SearchInput } from '~/components/ui/search-input'
import { ProgramGrid } from '~/components/programs/program-grid'
import { getPrograms, type Program } from '~/lib/api/programs'
import { cn } from '~/lib/utils'
import { Loader2 } from 'lucide-react'

export default function ProgramsPage() {
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPrograms = async () => {
        try {
            const data = await getPrograms()
            setPrograms(data)
        } catch (error) {
            console.error("Failed to load programs", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPrograms()
    }, [])

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Calculate Stats
    const totalPrograms = programs.length
    const activePrograms = programs.filter(p => p.status === 'active').length
    const planningPrograms = programs.filter(p => p.status === 'planning').length
    const completedPrograms = programs.filter(p => p.status === 'completed').length

    // Calculate overdue across all programs
    const programsAtRisk = programs.filter(p => (p.stats?.overdueTasks || 0) > 0 && p.status !== 'completed').length

    const avgProgress = totalPrograms > 0
        ? Math.round(programs.reduce((acc, curr) => acc + (curr.progress || 0), 0) / totalPrograms)
        : 0

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Audit Programs</h2>
                    <p className="text-muted-foreground text-lg">
                        Manage audit scopes, timelines, and compliance execution.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden md:block w-72">
                        <SearchInput placeholder="Search programs..." />
                    </div>
                    <Link to="/programs/new">
                        <Button size="lg" className="gap-2 shadow-sm">
                            <Plus className="h-5 w-5" />
                            New Program
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Programs */}
                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-slate-50 to-card dark:from-slate-900/40 dark:to-card rounded-xl border border-border/60 border-l-[3px] border-l-slate-400 shadow-sm">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                        <Users className="size-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">Total Programs</p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-3xl font-bold tracking-tight text-foreground">{totalPrograms}</span>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">All Time</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">{completedPrograms} completed</p>
                    </div>
                </div>

                {/* Active Audits */}
                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-emerald-50/50 to-card dark:from-emerald-950/20 dark:to-card rounded-xl border border-border/60 border-l-[3px] border-l-emerald-500 shadow-sm">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 shrink-0">
                        <Activity className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">Active Audits</p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{activePrograms}</span>
                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">In Progress</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">{planningPrograms} currently in planning</p>
                    </div>
                </div>

                {/* Attention Needed */}
                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-amber-50/50 to-card dark:from-amber-950/20 dark:to-card rounded-xl border border-border/60 border-l-[3px] border-l-amber-500 shadow-sm">
                    <div className={cn("flex items-center justify-center size-10 rounded-lg shrink-0", programsAtRisk > 0 ? "bg-amber-50 dark:bg-amber-950/40" : "bg-slate-100 dark:bg-slate-800")}>
                        <CheckCircle2 className={cn("size-5", programsAtRisk > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">Attention Needed</p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className={cn("text-3xl font-bold tracking-tight", programsAtRisk > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>{programsAtRisk}</span>
                            <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", programsAtRisk > 0 ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30" : "text-muted-foreground bg-muted")}>At Risk</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">Programs with overdue tasks</p>
                    </div>
                </div>

                {/* Average Completion */}
                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50/50 to-card dark:from-blue-950/20 dark:to-card rounded-xl border border-border/60 border-l-[3px] border-l-blue-500 shadow-sm">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 shrink-0">
                        <BarChart3 className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">Average Completion</p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-3xl font-bold tracking-tight text-foreground">{avgProgress}%</span>
                        </div>
                        <Progress
                            value={avgProgress}
                            className="h-1.5 mt-2 bg-slate-200 dark:bg-slate-700 rounded-full"
                            indicatorClassName={cn("rounded-full", avgProgress >= 75 ? "bg-emerald-500" : avgProgress >= 50 ? "bg-blue-500" : avgProgress >= 25 ? "bg-amber-500" : "bg-red-400")}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold tracking-tight">Active Programs</h3>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-muted-foreground">
                        Filter
                        <Users className="size-3" />
                    </Button>
                </div>
                <ProgramGrid programs={programs} onDelete={fetchPrograms} />
            </div>
        </div>
    )
}

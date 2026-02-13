'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '~/components/ui/chart'
import {
    Bar,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
    PieChart,
    Pie,
    RadialBarChart,
    RadialBar,
} from 'recharts'
import {
    Shield,
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileText,
    ArrowRight,
    Activity,
    ListChecks,
    Target,
    BookOpen,
    Layers,
    ChevronRight,
    ExternalLink,
} from 'lucide-react'
import type { DashboardStats } from '~/lib/api/dashboard'
import { Link } from 'react-router'

const frameworkChartConfig = {
    percentage: {
        label: 'Compliance %',
        color: 'hsl(var(--primary))',
    },
} satisfies ChartConfig

const taskChartConfig = {
    todo: { label: 'To Do', color: 'hsl(210, 40%, 70%)' },
    submitted: { label: 'Submitted', color: 'hsl(200, 80%, 55%)' },
    in_review: { label: 'In Review', color: 'hsl(40, 90%, 55%)' },
    approved: { label: 'Approved', color: 'hsl(150, 60%, 50%)' },
    completed: { label: 'Completed', color: 'hsl(140, 70%, 40%)' },
} satisfies ChartConfig

const riskChartConfig = {
    critical: { label: 'Critical', color: 'hsl(0, 72%, 51%)' },
    high: { label: 'High', color: 'hsl(25, 95%, 53%)' },
    medium: { label: 'Medium', color: 'hsl(45, 93%, 47%)' },
    low: { label: 'Low', color: 'hsl(142, 71%, 45%)' },
} satisfies ChartConfig

function getScoreColor(score: number) {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
}

function getScoreBarColor(score: number) {
    if (score >= 80) return 'hsl(152, 69%, 31%)'
    if (score >= 60) return 'hsl(45, 93%, 47%)'
    return 'hsl(0, 72%, 51%)'
}

function getStatusLabel(status: string) {
    const map: Record<string, string> = {
        todo: 'To Do',
        submitted: 'Submitted',
        in_review: 'In Review',
        approved: 'Approved',
        completed: 'Completed',
    }
    return map[status] || status
}

function getActivityIcon(details: string) {
    const d = details.toLowerCase()
    if (d.includes('approved') || d.includes('compliant')) return { icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600' }
    if (d.includes('risk') || d.includes('alert')) return { icon: AlertTriangle, bg: 'bg-amber-100 text-amber-600' }
    if (d.includes('created') || d.includes('added')) return { icon: Activity, bg: 'bg-blue-100 text-blue-600' }
    return { icon: FileText, bg: 'bg-slate-100 text-slate-600' }
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}

// Added CardAction component helper
const CardAction = ({ children }: { children: React.ReactNode }) => (
    <div className="ml-auto flex items-center gap-2">{children}</div>
)

export function DashboardView({ stats }: { stats: DashboardStats }) {
    const totalTasks = Object.values(stats.task_distribution).reduce((a, b) => a + b, 0)
    const completionRate = totalTasks > 0 ? Math.round((stats.task_distribution.completed / totalTasks) * 100) : 0

    const taskPieData = Object.entries(stats.task_distribution)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
            name: getStatusLabel(key),
            value,
            fill: taskChartConfig[key as keyof typeof taskChartConfig]?.color || 'hsl(0,0%,80%)',
        }))

    const riskPieData = Object.entries(stats.risk_severity)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
            name: riskChartConfig[key as keyof typeof riskChartConfig]?.label || key,
            value,
            fill: riskChartConfig[key as keyof typeof riskChartConfig]?.color || 'hsl(0,0%,80%)',
        }))

    const scoreRadialData = [{ name: 'score', value: stats.overall_score, fill: 'hsl(var(--primary))' }]

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* ─── Row 1: KPI Summary Strip ─── */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <KpiMini
                        label="Compliance Score"
                        value={`${stats.overall_score}%`}
                        icon={Shield}
                        colorClass={getScoreColor(stats.overall_score)}
                        href="/dashboard/compliance-status"
                    />
                    <KpiMini
                        label="Open Tasks"
                        value={stats.open_tasks}
                        icon={ListChecks}
                        colorClass="text-blue-600"
                        href="/tasks"
                    />
                    <KpiMini
                        label="Critical Risks"
                        value={stats.high_risks}
                        icon={AlertTriangle}
                        colorClass="text-red-600"
                        href="/risks"
                    />
                    <KpiMini
                        label="Controls"
                        value={stats.total_controls}
                        icon={Target}
                        colorClass="text-indigo-600"
                        href="/controls"
                    />
                    <KpiMini
                        label="Policies"
                        value={stats.total_policies}
                        icon={BookOpen}
                        colorClass="text-teal-600"
                        href="/policies"
                    />
                    <KpiMini
                        label="Active Programs"
                        value={stats.active_programs}
                        icon={Layers}
                        colorClass="text-orange-600"
                        href="/programs"
                    />
                </div>

                {/* ─── Row 2: Compliance Score + Framework Bar Chart ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Compliance Score Radial */}
                    <Card className="py-4">
                        <CardHeader className="pb-0 flex-row items-center space-y-0">
                            <div className="flex flex-col space-y-1.5">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall Compliance</CardTitle>
                                <CardDescription>Across all frameworks & controls</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center pt-2">
                            <ChartContainer config={{ score: { label: 'Score', color: 'hsl(var(--primary))' } }} className="h-[180px] w-[180px]">
                                <RadialBarChart
                                    innerRadius="70%"
                                    outerRadius="100%"
                                    data={scoreRadialData}
                                    startAngle={90}
                                    endAngle={-270}
                                    barSize={14}
                                >
                                    <RadialBar
                                        dataKey="value"
                                        cornerRadius={8}
                                        background={{ fill: 'hsl(var(--muted))' }}
                                    />
                                </RadialBarChart>
                            </ChartContainer>
                            <div className="text-center -mt-[108px] mb-14">
                                <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(stats.overall_score)}`}>
                                    {stats.overall_score}%
                                </span>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.overall_score >= 80 ? 'On Track' : stats.overall_score >= 60 ? 'Needs Attention' : 'At Risk'}
                                </p>
                            </div>
                            <div className="w-full grid grid-cols-3 gap-2 text-center mt-2">
                                <div>
                                    <p className="text-lg font-bold">{stats.total_frameworks}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Frameworks</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold">{stats.total_controls}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Controls</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold">{completionRate}%</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Task Rate</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Framework Compliance Bar Chart */}
                    <Card className="lg:col-span-2 py-4">
                        <CardHeader className="flex-row items-center space-y-0">
                            <div className="flex flex-col space-y-1.5">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Compliance by Framework</CardTitle>
                                <CardDescription>Readiness progress across configured standards</CardDescription>
                            </div>
                            <CardAction>
                                <Link to="/controls">
                                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                        View Details <ArrowRight className="size-3" />
                                    </Button>
                                </Link>
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            {stats.frameworks.length === 0 ? (
                                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                                    <div className="text-center">
                                        <Shield className="size-10 mx-auto mb-3 text-muted-foreground/40" />
                                        <p>No frameworks configured yet.</p>
                                        <Link to="/frameworks">
                                            <Button variant="link" size="sm" className="mt-1">Add Framework</Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <ChartContainer config={frameworkChartConfig} className="h-[250px] w-full">
                                    <BarChart
                                        data={stats.frameworks}
                                        margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
                                        layout="horizontal"
                                    >
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                                        <YAxis tickLine={false} axisLine={false} fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    formatter={(value, name, item) => (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">{String(value)}%</span>
                                                            <span className="text-muted-foreground">
                                                                ({(item.payload as any)?.compliant_controls}/{(item.payload as any)?.total_controls} controls)
                                                            </span>
                                                        </div>
                                                    )}
                                                />
                                            }
                                        />
                                        <Bar
                                            dataKey="percentage"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={48}
                                        >
                                            {stats.frameworks.map((fw) => (
                                                <Cell key={fw.id} fill={getScoreBarColor(fw.percentage)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Row 3: Task Distribution + Risk Distribution ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Task Distribution */}
                    <Card className="py-4">
                        <CardHeader className="flex-row items-center space-y-0">
                            <div className="flex flex-col space-y-1.5">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Task Pipeline</CardTitle>
                                <CardDescription>{totalTasks} total tasks across all programs</CardDescription>
                            </div>
                            <CardAction>
                                <Link to="/tasks">
                                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                        View All <ChevronRight className="size-3" />
                                    </Button>
                                </Link>
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            {totalTasks === 0 ? (
                                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                                    No tasks found.
                                </div>
                            ) : (
                                <div className="flex items-center gap-6">
                                    <ChartContainer config={taskChartConfig} className="h-[180px] w-[180px] shrink-0">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Pie
                                                data={taskPieData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius="55%"
                                                outerRadius="90%"
                                                paddingAngle={3}
                                                strokeWidth={0}
                                            />
                                        </PieChart>
                                    </ChartContainer>
                                    <div className="flex-1 space-y-2.5">
                                        {Object.entries(stats.task_distribution).map(([key, val]) => (
                                            <div key={key} className="flex items-center gap-3">
                                                <div
                                                    className="size-2.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: taskChartConfig[key as keyof typeof taskChartConfig]?.color }}
                                                />
                                                <span className="text-sm flex-1">{getStatusLabel(key)}</span>
                                                <span className="text-sm font-semibold tabular-nums">{val}</span>
                                                <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
                                                    {totalTasks > 0 ? Math.round((val / totalTasks) * 100) : 0}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Risk Distribution */}
                    <Card className="py-4">
                        <CardHeader className="flex-row items-center space-y-0">
                            <div className="flex flex-col space-y-1.5">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Risk Landscape</CardTitle>
                                <CardDescription>{stats.total_risks} risks identified across your environment</CardDescription>
                            </div>
                            <CardAction>
                                <Link to="/risks">
                                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                        View All <ChevronRight className="size-3" />
                                    </Button>
                                </Link>
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            {stats.total_risks === 0 ? (
                                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                                    No risks registered.
                                </div>
                            ) : (
                                <div className="flex items-center gap-6">
                                    <ChartContainer config={riskChartConfig} className="h-[180px] w-[180px] shrink-0">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Pie
                                                data={riskPieData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius="55%"
                                                outerRadius="90%"
                                                paddingAngle={3}
                                                strokeWidth={0}
                                            />
                                        </PieChart>
                                    </ChartContainer>
                                    <div className="flex-1 space-y-3">
                                        {Object.entries(stats.risk_severity).map(([key, val]) => {
                                            const cfg = riskChartConfig[key as keyof typeof riskChartConfig]
                                            return (
                                                <div key={key} className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="size-2.5 rounded-full shrink-0"
                                                                style={{ backgroundColor: cfg?.color }}
                                                            />
                                                            <span className="text-sm">{cfg?.label}</span>
                                                        </div>
                                                        <Badge
                                                            variant={key === 'critical' ? 'destructive' : 'secondary'}
                                                            className="text-[10px] px-1.5 h-5 font-semibold"
                                                        >
                                                            {val}
                                                        </Badge>
                                                    </div>
                                                    <Progress
                                                        value={stats.total_risks > 0 ? (val / stats.total_risks) * 100 : 0}
                                                        className="h-1.5"
                                                        indicatorClassName={key === 'critical' ? 'bg-red-500' : key === 'high' ? 'bg-orange-500' : key === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Row 4: Recent Activity + My Urgent Tasks ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <Card className="py-0 overflow-hidden">
                        <CardHeader className="py-4 border-b border-border flex-row items-center space-y-0">
                            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                            <CardAction>
                                <Link to="/audit-logs">
                                    <Button variant="link" size="sm" className="text-xs h-auto p-0 gap-1">
                                        View All <ExternalLink className="size-3" />
                                    </Button>
                                </Link>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[380px] overflow-y-auto">
                            {stats.recent_activity.length === 0 ? (
                                <div className="p-10 text-center text-muted-foreground text-sm">
                                    <Activity className="size-8 mx-auto mb-2 text-muted-foreground/40" />
                                    <p>No recent activity logged.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {stats.recent_activity.map((log) => {
                                        const { icon: Icon, bg } = getActivityIcon(log.details)
                                        return (
                                            <div key={log.id} className="flex gap-3 p-4 hover:bg-muted/40 transition-colors">
                                                <div className={`size-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                                                    <Icon className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium leading-snug truncate">{log.details}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-muted-foreground">
                                                            {log.actor_name}
                                                        </span>
                                                        <Separator orientation="vertical" className="h-3" />
                                                        <span className="text-xs text-muted-foreground">
                                                            {timeAgo(log.timestamp)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* My Urgent Tasks */}
                    <Card className="py-0 overflow-hidden">
                        <CardHeader className="py-4 border-b border-border flex-row items-center space-y-0">
                            <CardTitle className="text-sm font-semibold">My Pending Tasks</CardTitle>
                            <CardAction>
                                <Link to="/tasks">
                                    <Button variant="link" size="sm" className="text-xs h-auto p-0 gap-1">
                                        View All <ExternalLink className="size-3" />
                                    </Button>
                                </Link>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[380px] overflow-y-auto">
                            {stats.my_tasks.length === 0 ? (
                                <div className="p-10 text-center text-muted-foreground text-sm">
                                    <CheckCircle2 className="size-8 mx-auto mb-2 text-muted-foreground/40" />
                                    <p>No pending tasks assigned to you.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {stats.my_tasks.map((task) => {
                                        const isOverdue = task.due_date && new Date(task.due_date) < new Date()
                                        return (
                                            <Link key={task.id} to="/tasks" className="block">
                                                <div className="flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors group">
                                                    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        <Clock className="size-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium leading-snug truncate group-hover:text-primary transition-colors">
                                                            {task.control?.title || 'Untitled Task'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                            {task.program?.name}
                                                        </p>
                                                    </div>
                                                    {task.due_date && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Badge
                                                                    variant={isOverdue ? 'destructive' : 'secondary'}
                                                                    className="text-[10px] font-semibold shrink-0"
                                                                >
                                                                    {isOverdue ? 'Overdue' : `Due ${new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {new Date(task.due_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TooltipProvider>
    )
}

/* ─── Sub-components ─── */

function KpiMini({
    label,
    value,
    icon: Icon,
    colorClass,
    href,
}: {
    label: string
    value: string | number
    icon: React.ElementType
    colorClass: string
    href: string
}) {
    return (
        <Link to={href}>
            <Card className="py-4 hover:shadow-md transition-all duration-200 group cursor-pointer border-border">
                <CardContent className="px-4 flex items-center gap-3">
                    <div className={`size-9 rounded-lg bg-muted flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="size-4" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xl font-bold tracking-tight tabular-nums leading-none">{value}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1 truncate">{label}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import {
    CheckCircle2,
    AlertTriangle,
    Shield,
    TrendingUp,
    FileCheck,
    Target,
    XCircle,
    MinusCircle,
    ArrowRight,
    ArrowUpRight,
    Layers,
    ClipboardList,
    ShieldAlert,
    BarChart3,
    type LucideIcon
} from "lucide-react"
import { Link } from "react-router"
import type { DashboardStats } from "~/lib/api/dashboard"

type ComplianceSummary = DashboardStats['compliance_stats']

interface ComplianceStatsProps {
    frameworks: Array<{ id: string; name: string; control_count?: number }>
    stats: ComplianceSummary
}

function getHealthColor(score: number) {
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', ring: 'ring-emerald-200', label: 'Healthy', badge: 'default' as const }
    if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-500', ring: 'ring-amber-200', label: 'Needs Attention', badge: 'secondary' as const }
    return { text: 'text-red-600', bg: 'bg-red-500', ring: 'ring-red-200', label: 'At Risk', badge: 'destructive' as const }
}

export function ComplianceStatusView({ frameworks, stats }: ComplianceStatsProps) {
    const partialTasks = Math.max(0, stats.completedTasks - stats.compliantTasks - stats.nonCompliantTasks)
    const openRisks = stats.totalRisks - stats.mitigatedRisks
    const pendingTasks = stats.totalTasks - stats.completedTasks
    const health = getHealthColor(stats.complianceRate)

    return (
        <div className="space-y-6">

            {/* ─── Hero: Compliance Posture Summary ─── */}
            <Card className="py-0 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Left: Score */}
                    <div className="flex-shrink-0 p-6 lg:p-8 lg:w-[280px] flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border bg-muted/30">
                        <ComplianceGauge value={stats.complianceRate} />
                        <Badge variant={health.badge} className="mt-3 text-xs px-2.5">
                            {health.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Based on {stats.completedTasks} completed assessments
                        </p>
                    </div>

                    {/* Right: Key Metrics Grid */}
                    <div className="flex-1 p-6 lg:p-8">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-base font-semibold">Compliance Posture</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Key performance indicators across your GRC program
                                </p>
                            </div>
                            <Link to="/dashboard">
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs hidden sm:flex">
                                    Dashboard <ArrowUpRight className="size-3" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricTile
                                icon={ClipboardList}
                                label="Task Completion"
                                value={`${stats.taskCompletionRate}%`}
                                detail={`${stats.completedTasks}/${stats.totalTasks} done`}
                                color="text-blue-600"
                                bg="bg-blue-50 dark:bg-blue-950/30"
                            />
                            <MetricTile
                                icon={Layers}
                                label="Active Programs"
                                value={stats.activePrograms}
                                detail={`${stats.completedPrograms} completed`}
                                color="text-indigo-600"
                                bg="bg-indigo-50 dark:bg-indigo-950/30"
                            />
                            <MetricTile
                                icon={ShieldAlert}
                                label="Open Risks"
                                value={openRisks}
                                detail={`${stats.criticalRisks} critical`}
                                color={stats.criticalRisks > 0 ? 'text-red-600' : 'text-amber-600'}
                                bg={stats.criticalRisks > 0 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}
                            />
                            <MetricTile
                                icon={FileCheck}
                                label="Pending Tasks"
                                value={pendingTasks}
                                detail={pendingTasks === 0 ? 'All caught up!' : 'Awaiting action'}
                                color="text-orange-600"
                                bg="bg-orange-50 dark:bg-orange-950/30"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* ─── Row 2: Assessment Breakdown + Task Progress ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Assessment Results — wider */}
                <Card className="lg:col-span-3 py-4">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <BarChart3 className="size-4 text-muted-foreground" />
                            Assessment Results
                        </CardTitle>
                        <CardDescription>
                            Breakdown of {stats.completedTasks} completed control assessments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.completedTasks === 0 ? (
                            <EmptyState
                                icon={CheckCircle2}
                                message="No assessments completed yet"
                                hint="Complete task assessments to see compliance breakdown here."
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ResultCard
                                    icon={CheckCircle2}
                                    label="Compliant"
                                    value={stats.compliantTasks}
                                    total={stats.completedTasks}
                                    color="emerald"
                                />
                                <ResultCard
                                    icon={MinusCircle}
                                    label="Partial"
                                    value={partialTasks}
                                    total={stats.completedTasks}
                                    color="amber"
                                />
                                <ResultCard
                                    icon={XCircle}
                                    label="Non-Compliant"
                                    value={stats.nonCompliantTasks}
                                    total={stats.completedTasks}
                                    color="red"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Task Progress Bars — compact */}
                <Card className="lg:col-span-2 py-4">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Target className="size-4 text-muted-foreground" />
                            Task Progress
                        </CardTitle>
                        <CardDescription>
                            {stats.totalTasks} total across all programs
                        </CardDescription>
                        <div className="ml-auto">
                            <Link to="/tasks">
                                <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                                    View <ArrowRight className="size-3" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {stats.totalTasks === 0 ? (
                            <EmptyState
                                icon={ClipboardList}
                                message="No tasks created yet"
                                hint="Create audit programs to generate tasks."
                            />
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm font-medium">Overall Completion</span>
                                        <span className="text-sm font-bold tabular-nums">{stats.taskCompletionRate}%</span>
                                    </div>
                                    <Progress value={stats.taskCompletionRate} className="h-2.5" />
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <ProgressRow label="Completed" value={stats.completedTasks} total={stats.totalTasks} color="bg-emerald-500" />
                                    <ProgressRow label="Pending" value={pendingTasks} total={stats.totalTasks} color="bg-blue-500" />
                                    {stats.compliantTasks > 0 && (
                                        <ProgressRow label="Compliant" value={stats.compliantTasks} total={stats.completedTasks} color="bg-emerald-500" />
                                    )}
                                    {stats.nonCompliantTasks > 0 && (
                                        <ProgressRow label="Non-Compliant" value={stats.nonCompliantTasks} total={stats.completedTasks} color="bg-red-500" />
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ─── Row 3: Framework Coverage + Risk Overview ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Framework Coverage */}
                <Card className="py-4">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Shield className="size-4 text-muted-foreground" />
                            Framework Coverage
                        </CardTitle>
                        <CardDescription>Controls mapped per compliance framework</CardDescription>
                        <div className="ml-auto">
                            <Link to="/frameworks">
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
                                    Manage <ArrowRight className="size-3" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {frameworks.length === 0 ? (
                            <EmptyState
                                icon={Shield}
                                message="No frameworks configured"
                                hint="Add compliance frameworks to track your control coverage."
                                action={{ label: 'Add Framework', href: '/frameworks' }}
                            />
                        ) : (
                            <div className="space-y-4">
                                {frameworks.map((fw, idx) => {
                                    const count = fw.control_count || 0
                                    const maxCount = Math.max(...frameworks.map(f => f.control_count || 0), 1)
                                    const pct = Math.round((count / maxCount) * 100)
                                    return (
                                        <div key={fw.id}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-medium truncate pr-4">{fw.name}</span>
                                                <Badge variant="secondary" className="text-[10px] font-semibold h-5 px-1.5 shrink-0 tabular-nums">
                                                    {count} controls
                                                </Badge>
                                            </div>
                                            <Progress value={pct} className="h-2" />
                                            {idx < frameworks.length - 1 && <Separator className="mt-4" />}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Risk Overview */}
                <Card className="py-4">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="size-4 text-muted-foreground" />
                            Risk Overview
                        </CardTitle>
                        <CardDescription>Distribution by resolution status</CardDescription>
                        <div className="ml-auto">
                            <Link to="/risks">
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
                                    View All <ArrowRight className="size-3" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {stats.totalRisks === 0 ? (
                            <EmptyState
                                icon={CheckCircle2}
                                message="No risks registered"
                                hint="Your risk register is empty. Looking good!"
                            />
                        ) : (
                            <div className="space-y-4">
                                <RiskBar
                                    critical={stats.criticalRisks}
                                    open={Math.max(0, openRisks - stats.criticalRisks)}
                                    mitigated={stats.mitigatedRisks}
                                    total={stats.totalRisks}
                                />
                                <Separator />
                                <div className="space-y-3">
                                    <RiskRow
                                        icon={XCircle}
                                        label="Critical"
                                        value={stats.criticalRisks}
                                        total={stats.totalRisks}
                                        colorDot="bg-red-500"
                                        bgClass="bg-red-50 dark:bg-red-950/20"
                                        variant="destructive"
                                    />
                                    <RiskRow
                                        icon={AlertTriangle}
                                        label="Open"
                                        value={Math.max(0, openRisks - stats.criticalRisks)}
                                        total={stats.totalRisks}
                                        colorDot="bg-orange-500"
                                        bgClass="bg-orange-50 dark:bg-orange-950/20"
                                        variant="secondary"
                                    />
                                    <RiskRow
                                        icon={CheckCircle2}
                                        label="Mitigated"
                                        value={stats.mitigatedRisks}
                                        total={stats.totalRisks}
                                        colorDot="bg-emerald-500"
                                        bgClass="bg-emerald-50 dark:bg-emerald-950/20"
                                        variant="default"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

/* ─── Sub-components ─── */

function ComplianceGauge({ value }: { value: number }) {
    const health = getHealthColor(value)
    const circumference = 2 * Math.PI * 54
    const offset = circumference - (value / 100) * circumference

    return (
        <div className="relative size-[140px]">
            <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="10" />
                <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${health.text} transition-all duration-700 ease-out`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-extrabold tracking-tight ${health.text}`}>
                    {value}%
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                    Compliance
                </span>
            </div>
        </div>
    )
}

function MetricTile({
    icon: Icon, label, value, detail, color, bg,
}: {
    icon: LucideIcon; label: string; value: string | number; detail: string; color: string; bg: string
}) {
    return (
        <div className={`rounded-xl p-4 ${bg} space-y-2`}>
            <div className="flex items-center gap-2">
                <Icon className={`size-4 ${color}`} strokeWidth={2} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-extrabold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
    )
}

function ResultCard({
    icon: Icon, label, value, total, color,
}: {
    icon: LucideIcon; label: string; value: number; total: number; color: 'emerald' | 'amber' | 'red'
}) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0
    const colorMap = {
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600', bar: 'bg-emerald-500', icon: 'text-emerald-500' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600', bar: 'bg-amber-500', icon: 'text-amber-500' },
        red: { bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-600', bar: 'bg-red-500', icon: 'text-red-500' },
    }
    const c = colorMap[color]

    return (
        <div className={`rounded-xl p-5 ${c.bg} flex flex-col justify-between min-h-[140px]`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className={`size-4 ${c.icon}`} />
                    <span className="text-sm font-semibold">{label}</span>
                </div>
                <span className="text-xs text-muted-foreground font-semibold tabular-nums">{pct}%</span>
            </div>
            <div>
                <p className={`text-3xl font-extrabold ${c.text} mt-3`}>{value}</p>
                <Progress value={pct} className="h-1.5 mt-3" indicatorClassName={c.bar} />
            </div>
        </div>
    )
}

function ProgressRow({
    label, value, total, color,
}: {
    label: string; value: number; total: number; color: string
}) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <div className={`size-2 rounded-full ${color}`} />
                    <span className="text-sm">{label}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                    {value} <span className="text-muted-foreground font-normal text-xs">({pct}%)</span>
                </span>
            </div>
            <Progress value={pct} className="h-1.5" indicatorClassName={color} />
        </div>
    )
}

function RiskBar({
    critical, open, mitigated, total,
}: {
    critical: number; open: number; mitigated: number; total: number
}) {
    if (total === 0) return null
    const segments = [
        { value: critical, color: 'bg-red-500', label: 'Critical' },
        { value: open, color: 'bg-orange-500', label: 'Open' },
        { value: mitigated, color: 'bg-emerald-500', label: 'Mitigated' },
    ].filter(s => s.value > 0)

    return (
        <div>
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                {segments.map((seg, i) => (
                    <div
                        key={seg.label}
                        className={`${seg.color} transition-all duration-500`}
                        style={{ width: `${(seg.value / total) * 100}%` }}
                    />
                ))}
            </div>
            <div className="flex items-center justify-between mt-2">
                {segments.map(seg => (
                    <div key={seg.label} className="flex items-center gap-1.5">
                        <div className={`size-2 rounded-full ${seg.color}`} />
                        <span className="text-[10px] text-muted-foreground font-medium">{seg.label} ({Math.round((seg.value / total) * 100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function RiskRow({
    icon: Icon, label, value, total, colorDot, bgClass, variant,
}: {
    icon: LucideIcon; label: string; value: number; total: number; colorDot: string; bgClass: string; variant: 'destructive' | 'secondary' | 'default'
}) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0
    return (
        <div className={`flex items-center justify-between p-3.5 rounded-xl ${bgClass}`}>
            <div className="flex items-center gap-3">
                <div className={`size-2.5 rounded-full ${colorDot}`} />
                <Icon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
                <Badge variant={variant} className="text-[10px] font-bold h-5 px-2 min-w-[28px] justify-center tabular-nums">
                    {value}
                </Badge>
            </div>
        </div>
    )
}

function EmptyState({
    icon: Icon, message, hint, action,
}: {
    icon: LucideIcon; message: string; hint?: string; action?: { label: string; href: string }
}) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="size-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                <Icon className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{message}</p>
            {hint && <p className="text-xs text-muted-foreground/70 mt-1 max-w-[240px]">{hint}</p>}
            {action && (
                <Link to={action.href}>
                    <Button variant="link" size="sm" className="mt-2 text-xs">
                        {action.label}
                    </Button>
                </Link>
            )}
        </div>
    )
}

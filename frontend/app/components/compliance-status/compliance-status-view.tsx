'use client'

import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import { Badge } from '~/components/ui/badge'
import {
    CheckCircle2,
    AlertTriangle,
    Shield,
    TrendingUp,
    FileCheck,
    Target
} from 'lucide-react'
import type { ComplianceData } from '~/lib/api/compliance'

interface ComplianceStatusViewProps {
    data: ComplianceData
}

export function ComplianceStatusView({ data }: ComplianceStatusViewProps) {
    const { frameworks, stats } = data

    const statCards = [
        {
            title: 'Task Completion',
            value: `${stats.taskCompletionRate}%`,
            subtitle: `${stats.completedTasks} of ${stats.totalTasks} tasks`,
            icon: FileCheck,
            color: 'text-blue-500'
        },
        {
            title: 'Compliance Rate',
            value: `${stats.complianceRate}%`,
            subtitle: `${stats.compliantTasks} compliant assessments`,
            icon: CheckCircle2,
            color: 'text-emerald-500'
        },
        {
            title: 'Active Programs',
            value: stats.activePrograms,
            subtitle: `${stats.completedPrograms} completed`,
            icon: Target,
            color: 'text-indigo-500'
        },
        {
            title: 'Open Risks',
            value: stats.totalRisks - stats.mitigatedRisks,
            subtitle: `${stats.criticalRisks} critical`,
            icon: AlertTriangle,
            color: stats.criticalRisks > 0 ? 'text-red-500' : 'text-amber-500'
        }
    ]

    return (
        <>
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {statCards.map((card, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Framework Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Framework Coverage
                        </CardTitle>
                        <CardDescription>
                            Controls mapped per compliance framework
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {frameworks.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No frameworks configured yet.
                            </p>
                        ) : (
                            frameworks.map((fw) => (
                                <div key={fw.id} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{fw.name}</span>
                                        <span className="text-muted-foreground">
                                            {fw.control_count || 0} controls
                                        </span>
                                    </div>
                                    <Progress
                                        value={fw.control_count ? 100 : 0} // In real app, this should be completion %
                                        className="h-2"
                                    />
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Risk Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Risk Overview
                        </CardTitle>
                        <CardDescription>
                            Current risk distribution by status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span className="font-medium">Critical Risks</span>
                                </div>
                                <Badge variant="destructive">{stats.criticalRisks}</Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <span className="font-medium">Open Risks</span>
                                </div>
                                <Badge variant="secondary">{stats.totalRisks - stats.mitigatedRisks}</Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="font-medium">Mitigated</span>
                                </div>
                                <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">{stats.mitigatedRisks}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Non-Compliance Summary */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Compliance Assessment Summary</CardTitle>
                        <CardDescription>
                            Results from completed control assessments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                                <div className="text-3xl font-bold text-emerald-600">{stats.compliantTasks}</div>
                                <div className="text-sm text-muted-foreground mt-1">Compliant</div>
                            </div>
                            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                                <div className="text-3xl font-bold text-amber-600">
                                    {stats.completedTasks - stats.compliantTasks - stats.nonCompliantTasks}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">Partial</div>
                            </div>
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                <div className="text-3xl font-bold text-red-600">{stats.nonCompliantTasks}</div>
                                <div className="text-sm text-muted-foreground mt-1">Non-Compliant</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

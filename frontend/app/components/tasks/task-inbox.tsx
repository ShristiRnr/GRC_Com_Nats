"use client"

import { useNavigate, useSearchParams } from "react-router"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
// Using standard Table components from ui/table to match v1 imports
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "~/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import {
    CheckCircle,
    Clock,
    Send,
    RotateCcw,
    AlertTriangle,
    ClipboardCheck,
    User,
    Users,
    Shield,
    CheckCircle2,
    Briefcase,
    Calendar,
    ArrowRight,
    ListFilter,
    Inbox,
    Eye,
    TrendingUp,
    FileCheck,
    Timer
} from "lucide-react"
import { TaskActionDialog } from "./task-action-dialog"
import { EmptyState } from "~/components/ui/empty-state"
import { cn } from "~/lib/utils"
// Use Task type from api
import type { Task } from "~/lib/api/tasks"

interface TaskInboxProps {
    tasks: Task[]
    allTasks?: Task[]
    activeTab: string
    tabCounts: {
        owner: number
        reviewer: number
        assessor: number
    }
    currentUserId: string
    onSuccess: () => void
}

export function TaskInbox({ tasks, allTasks = [], activeTab, tabCounts, currentUserId, onSuccess }: TaskInboxProps) {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [actionTask, setActionTask] = useState<{ task: Task; action: string } | null>(null)
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
    const [showAllTasks, setShowAllTasks] = useState(false)

    // Use allTasks when viewing all, otherwise use filtered tasks
    const displayTasks = showAllTasks && allTasks.length > 0 ? allTasks : tasks

    const handleTabChange = (tab: string) => {
        setShowAllTasks(false)
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', tab)
        navigate(`/tasks?${params.toString()}`)
    }

    // Filter tasks by status
    const filteredTasks = displayTasks.filter(task => {
        if (statusFilter === 'all') return true
        if (statusFilter === 'pending') return task.status === 'todo' || task.status === 'refer_back'
        if (statusFilter === 'in_progress') return task.status === 'submitted' || task.status === 'in_review' || task.status === 'in_assessment'
        if (statusFilter === 'completed') return task.status === 'completed' || task.status === 'approved'
        return true
    })

    // Status filter counts
    const statusCounts = {
        all: displayTasks.length,
        pending: displayTasks.filter(t => t.status === 'todo' || t.status === 'refer_back').length,
        in_progress: displayTasks.filter(t => t.status === 'submitted' || t.status === 'in_review' || t.status === 'in_assessment').length,
        completed: displayTasks.filter(t => t.status === 'completed' || t.status === 'approved').length
    }

    // Calculate overall stats
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter(t => t.status === 'completed' || t.status === 'approved').length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const dueSoonTasks = allTasks.filter(t => {
        if (!t.due_date) return false
        const dueDate = new Date(t.due_date)
        const now = new Date()
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        return dueDate >= now && dueDate <= weekFromNow
    }).length
    const overdueTasks = allTasks.filter(t => {
        if (!t.due_date || t.status === 'completed' || t.status === 'approved') return false
        return new Date(t.due_date) < new Date()
    }).length

    const getStatusBadge = (status: string, result?: string | null) => {
        const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
            todo: { label: 'To Do', className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', icon: Clock },
            submitted: { label: 'Pending Review', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800', icon: Send },
            in_review: { label: 'In Review', className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800', icon: Eye },
            approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800', icon: CheckCircle2 },
            refer_back: { label: 'Returned', className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800', icon: RotateCcw },
            in_assessment: { label: 'Assessment', className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800', icon: ClipboardCheck },
            completed: { label: 'Completed', className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800', icon: CheckCircle }
        }

        if (status === 'completed' && result === 'non_compliant') {
            return (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Non-Compliant
                </Badge>
            )
        }
        if (status === 'completed' && result === 'partial') {
            return (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800 gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Partial
                </Badge>
            )
        }

        const config = statusConfig[status] || statusConfig.todo
        const Icon = config.icon
        return (
            <Badge variant="outline" className={cn("font-medium gap-1", config.className)}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        )
    }

    const getInitials = (name?: string) => {
        if (!name) return '?'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const isOverdue = (dueDate?: string | null) => {
        if (!dueDate) return false
        return new Date(dueDate) < new Date()
    }

    const renderActions = (task: Task) => {
        if (activeTab === 'owner') {
            return <></>
        }

        if (activeTab === 'reviewer') {
            if (task.status === 'submitted' || task.status === 'in_review') {
                return (
                    <div className="flex gap-2 justify-end">
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                setActionTask({ task, action: 'approve' })
                            }}
                            className="gap-1 h-8 px-3 bg-emerald-600 hover:bg-emerald-700"
                        >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation()
                                setActionTask({ task, action: 'refer_back' })
                            }}
                            className="gap-1 h-8 px-3"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Return
                        </Button>
                    </div>
                )
            }
        }

        if (activeTab === 'assessor') {
            if (task.status === 'approved' || task.status === 'in_assessment') {
                return (
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/tasks/${task.id}/assess`)
                        }}
                        className="gap-1 h-8 px-3"
                    >
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        Assess
                    </Button>
                )
            }
        }

        return <span className="text-sm text-muted-foreground">—</span>
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Task Inbox</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track compliance tasks across your organization
                    </p>
                </div>
                <Button
                    variant={showAllTasks ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAllTasks(!showAllTasks)}
                    className="gap-2"
                >
                    <Eye className="h-4 w-4" />
                    {showAllTasks ? "Viewing All Tasks" : "View All Tasks"}
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                        <FileCheck className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTasks}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {completedTasks} completed
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completionRate}%</div>
                        <Progress value={completionRate} className="h-1.5 mt-2" />
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Due This Week</CardTitle>
                        <Timer className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dueSoonTasks}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Needs attention soon
                        </p>
                    </CardContent>
                </Card>

                <Card className={cn("border-l-4", overdueTasks > 0 ? "border-l-red-500" : "border-l-slate-300")}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
                        <AlertTriangle className={cn("h-4 w-4", overdueTasks > 0 ? "text-red-500" : "text-slate-400")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", overdueTasks > 0 && "text-red-600")}>{overdueTasks}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {overdueTasks === 0 ? "All on track" : "Requires immediate attention"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                {/* Role Tabs & Status Filter */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                    <TabsList className="bg-muted/50 p-1 h-auto">
                        <TabsTrigger
                            value="owner"
                            className="gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">My Tasks</span>
                            <span className="sm:hidden">Mine</span>
                            {tabCounts.owner > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[0.65rem] bg-primary/10 text-primary font-semibold">
                                    {tabCounts.owner}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="reviewer"
                            className="gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">To Review</span>
                            <span className="sm:hidden">Review</span>
                            {tabCounts.reviewer > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[0.65rem] bg-amber-500/10 text-amber-600 font-semibold">
                                    {tabCounts.reviewer}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="assessor"
                            className="gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">To Assess</span>
                            <span className="sm:hidden">Assess</span>
                            {tabCounts.assessor > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[0.65rem] bg-violet-500/10 text-violet-600 font-semibold">
                                    {tabCounts.assessor}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Status Filter Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground mr-1 hidden lg:inline">
                            <ListFilter className="h-3.5 w-3.5 inline mr-1" />
                            Filter:
                        </span>
                        {[
                            { key: 'all', label: 'All', count: statusCounts.all },
                            { key: 'pending', label: 'Pending', count: statusCounts.pending, color: 'amber' },
                            { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress, color: 'blue' },
                            { key: 'completed', label: 'Completed', count: statusCounts.completed, color: 'green' }
                        ].map(filter => (
                            <Button
                                key={filter.key}
                                size="sm"
                                variant={statusFilter === filter.key ? 'secondary' : 'ghost'}
                                onClick={() => setStatusFilter(filter.key as any)}
                                className={cn(
                                    "h-8 text-xs px-3 rounded-full",
                                    statusFilter === filter.key && "shadow-sm"
                                )}
                            >
                                {filter.label}
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "ml-1.5 h-4 px-1.5 text-[10px] rounded-full",
                                        filter.color === 'amber' && "border-amber-300 text-amber-600",
                                        filter.color === 'blue' && "border-blue-300 text-blue-600",
                                        filter.color === 'green' && "border-green-300 text-green-600"
                                    )}
                                >
                                    {filter.count}
                                </Badge>
                            </Button>
                        ))}
                    </div>
                </div>

                <TabsContent value={activeTab} className="m-0">
                    <Card className="shadow-sm">
                        <CardHeader className="px-6 py-4 border-b bg-muted/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">
                                        {showAllTasks ? 'All Organization Tasks' : (
                                            <>
                                                {activeTab === 'owner' && 'Tasks Assigned to You'}
                                                {activeTab === 'reviewer' && 'Tasks Awaiting Your Review'}
                                                {activeTab === 'assessor' && 'Tasks Awaiting Assessment'}
                                            </>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        {showAllTasks ? 'Showing all visible tasks across the organization' : (
                                            <>
                                                {activeTab === 'owner' && 'Complete your assigned compliance activities and submit evidence'}
                                                {activeTab === 'reviewer' && 'Review submitted evidence and approve or return for changes'}
                                                {activeTab === 'assessor' && 'Assess control effectiveness and determine compliance status'}
                                            </>
                                        )}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="hidden sm:flex">
                                    {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredTasks.length === 0 ? (
                                <div className="py-16 px-4">
                                    <EmptyState
                                        icon={Inbox}
                                        title="No tasks found"
                                        description={
                                            showAllTasks
                                                ? "There are no visible tasks in the organization yet."
                                                : statusFilter !== 'all'
                                                    ? `No ${statusFilter.replace('_', ' ')} tasks in this queue.`
                                                    : "You're all caught up! No tasks require your attention."
                                        }
                                    />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                                            <TableHead className="w-[35%] font-semibold">Task</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Due Date</TableHead>
                                            <TableHead className="font-semibold">
                                                {activeTab === 'reviewer' ? 'Owner' : 'Reviewer'}
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTasks.map((task) => (
                                            <TableRow
                                                key={task.id}
                                                className="group cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="font-medium text-sm leading-tight">
                                                            {task.control?.title || task.control?.code || 'Unknown Control'}
                                                        </span>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Briefcase className="h-3 w-3" />
                                                                {task.program?.name || 'No Program'}
                                                            </span>
                                                            {task.control?.code && (
                                                                <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                                                    {task.control.code}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(task.status, task.result)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className={cn(
                                                        "flex items-center gap-2 text-sm",
                                                        isOverdue(task.due_date) && task.status !== 'completed' && task.status !== 'approved' && "text-red-600 font-medium"
                                                    )}>
                                                        <Calendar className={cn(
                                                            "h-3.5 w-3.5",
                                                            isOverdue(task.due_date) && task.status !== 'completed' && task.status !== 'approved' ? "text-red-500" : "text-muted-foreground"
                                                        )} />
                                                        {task.due_date
                                                            ? new Date(task.due_date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: new Date(task.due_date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                                            })
                                                            : '—'
                                                        }
                                                        {isOverdue(task.due_date) && task.status !== 'completed' && task.status !== 'approved' && (
                                                            <Badge variant="destructive" className="text-[10px] h-4 px-1">Overdue</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-7 w-7 border">
                                                            <AvatarImage src="" />
                                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                                                                {activeTab === 'reviewer'
                                                                    ? getInitials(task.owner?.full_name ?? undefined)
                                                                    : getInitials(task.reviewer?.full_name ?? undefined)
                                                                }
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium leading-none">
                                                                {activeTab === 'reviewer'
                                                                    ? task.owner?.full_name || 'Unassigned'
                                                                    : task.reviewer?.full_name || 'Unassigned'
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {renderActions(task)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {actionTask && (
                <TaskActionDialog
                    task={actionTask.task}
                    action={actionTask.action}
                    onClose={() => setActionTask(null)}
                    onSuccess={onSuccess}
                />
            )}
        </div>
    )
}

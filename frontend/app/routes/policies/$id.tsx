"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router"
import { getPolicy, getPolicyClauses } from "~/lib/api/policies"
import type { Policy, PolicyClause } from "~/lib/api/policies"
import { AddClauseDialog } from "~/components/policies/add-clause-dialog"
import { Button } from "~/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import {
    ArrowLeft,
    FileText,
    ShieldCheck,
    Calendar,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Edit,
    Download,
    MoreHorizontal,
    ListChecks,
    Users,
    BookOpen,
    Loader2,
} from "lucide-react"

export default function PolicyDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [policy, setPolicy] = useState<Policy | null>(null)
    const [clauses, setClauses] = useState<PolicyClause[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        if (!id) return
        try {
            const [policyData, clausesData] = await Promise.all([
                getPolicy(id),
                getPolicyClauses(id),
            ])
            setPolicy(policyData)
            setClauses(clausesData)
        } catch (error) {
            console.error("Failed to load policy", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [id])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!policy) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <h2 className="text-xl font-bold">Policy Not Found</h2>
                <Link to="/policies" className="text-primary mt-2 hover:underline">
                    Back to Policies
                </Link>
            </div>
        )
    }

    // Calculate stats
    const totalClauses = clauses.length
    const mappedClauses = clauses.filter(c => c.control_id && c.control_id !== "00000000-0000-0000-0000-000000000000").length
    const mappingProgress = totalClauses > 0 ? Math.round((mappedClauses / totalClauses) * 100) : 0

    // Calculate days until next review
    const nextReviewDate = new Date(policy.next_review)
    const today = new Date()
    const daysUntilReview = Math.ceil((nextReviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const isOverdue = daysUntilReview < 0
    const isUpcoming = daysUntilReview >= 0 && daysUntilReview <= 30

    // Status badge styling
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'published':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300'
            case 'draft':
                return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300'
            case 'archived':
            case 'deprecated':
                return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300'
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
        }
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Breadcrumb & Header */}
            <div className="flex flex-col gap-4">
                <Link to="/policies" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit transition-colors">
                    <ArrowLeft className="size-4" /> Back to Policies
                </Link>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <FileText className="size-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">{policy.title}</h1>
                                <Badge className={`${getStatusStyle(policy.status)} border font-medium`}>
                                    {policy.status}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Badge variant="outline" className="font-mono text-xs">{policy.version}</Badge>
                                <span className="flex items-center gap-1">
                                    <Calendar className="size-3.5" />
                                    Last reviewed {new Date(policy.last_reviewed).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="size-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Edit className="size-4 mr-2" />
                            Edit
                        </Button>
                        <Button size="sm">
                            Publish
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="shadow-xs border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Clauses</CardTitle>
                        <ListChecks className="h-4 w-4 text-primary opacity-70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClauses}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Policy requirements defined
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Control Mapping</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-primary opacity-70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mappingProgress}%</div>
                        <Progress value={mappingProgress} className="h-1.5 mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {mappedClauses} of {totalClauses} clauses mapped
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Next Review</CardTitle>
                        {isOverdue ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : isUpcoming ? (
                            <Clock className="h-4 w-4 text-amber-500" />
                        ) : (
                            <Calendar className="h-4 w-4 text-primary opacity-70" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${isOverdue ? 'text-red-600' : isUpcoming ? 'text-amber-600' : ''}`}>
                            {isOverdue ? `${Math.abs(daysUntilReview)}d overdue` : `${daysUntilReview} days`}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {nextReviewDate.toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border-border/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Compliance</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {policy.status === 'active' ? 'Active' : policy.status === 'draft' ? 'Draft' : 'Inactive'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {policy.status === 'active' ? 'Policy is in effect' : 'Pending approval'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Clauses Section */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
                            <div>
                                <CardTitle className="text-base font-semibold">Policy Clauses</CardTitle>
                                <CardDescription className="text-xs">
                                    Requirements and provisions defined in this policy
                                </CardDescription>
                            </div>
                            <AddClauseDialog policyId={policy.id} onSuccess={fetchData} />
                        </CardHeader>
                        <CardContent className="p-0">
                            {clauses.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <BookOpen className="size-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-medium">No clauses defined yet</p>
                                    <p className="text-xs mt-1">Add clauses to define policy requirements</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {clauses.map((clause, index) => (
                                        <div key={clause.id} className="p-4 hover:bg-muted/30 transition-colors group">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex gap-3">
                                                    <div className="flex-shrink-0 size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-semibold text-sm text-primary">{clause.clause_id}</span>
                                                            {clause.control_id && clause.control_id !== "00000000-0000-0000-0000-000000000000" ? (
                                                                <Badge variant="secondary" className="text-[10px] flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                                    <ShieldCheck className="size-3" />
                                                                    Mapped
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300">
                                                                    Unmapped
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-foreground/90 leading-relaxed">
                                                            {clause.content}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity size-8">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Metadata Card */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b border-border/50 bg-muted/20 pb-3">
                            <CardTitle className="text-sm font-semibold">Policy Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border text-sm">
                                <div className="flex justify-between items-center p-3">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge className={`${getStatusStyle(policy.status)} border font-medium`}>
                                        {policy.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center p-3">
                                    <span className="text-muted-foreground">Version</span>
                                    <span className="font-mono font-medium">{policy.version}</span>
                                </div>
                                <div className="flex justify-between items-center p-3">
                                    <span className="text-muted-foreground">Last Reviewed</span>
                                    <span>{new Date(policy.last_reviewed).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-3">
                                    <span className="text-muted-foreground">Next Review</span>
                                    <span className={isOverdue ? 'text-red-600 font-medium' : isUpcoming ? 'text-amber-600 font-medium' : ''}>
                                        {nextReviewDate.toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ownership Card */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b border-border/50 bg-muted/20 pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Users className="size-4" />
                                Ownership
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border text-sm">
                                <div className="flex justify-between items-center p-3">
                                    <span className="text-muted-foreground">Owner</span>
                                    <span className="font-medium">Compliance Team</span>
                                </div>
                                <div className="flex justify-between items-center p-3">
                                    <span className="text-muted-foreground">Approver</span>
                                    <span className="font-medium">CISO</span>
                                </div>
                                <div className="flex justify-between items-center p-3">
                                    <span className="text-muted-foreground">Department</span>
                                    <span>Information Security</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b border-border/50 bg-muted/20 pb-3">
                            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2">
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <FileText className="size-4 mr-2" />
                                View Full Document
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <Download className="size-4 mr-2" />
                                Download PDF
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <Calendar className="size-4 mr-2" />
                                Schedule Review
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

"use client"

import { type Control, type Evidence, type ControlTask } from "~/lib/api/controls"
import { useNavigate } from "react-router"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    AlertTriangle,
    FileText,
    Download,
    ExternalLink,
    Shield,
    History,
    ClipboardList,
    User,
    Calendar,
    Building2,
    Tag,
    ShieldCheck,
    Link as LinkIcon,
    MinusCircle,
    Server,
    Edit,
    Trash2,
    Activity,
    Eye
} from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { ControlAssetList } from "./control-asset-list"
import { ControlRiskList } from "./control-risk-list"
import { AddEvidenceDialog } from "./add-evidence-dialog"
import { LinkAssetDialog } from "./link-asset-dialog"
import { LinkRiskDialog } from "./link-risk-dialog"

interface ControlDetailViewProps {
    control: Control
    onRefresh: () => void
}

export function ControlDetailView({ control, onRefresh }: ControlDetailViewProps) {
    const navigate = useNavigate()

    const handleDownload = async (evidenceId: string, fileUrl: string | undefined, filePath: string | undefined) => {
        if (fileUrl) {
            window.open(fileUrl, '_blank')
            return
        }
        if (filePath) {
            window.open(filePath, '_blank')
        } else {
            toast.info('No downloadable file available')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 uppercase text-[10px] font-bold">Active</Badge>
            case 'inactive':
                return <Badge variant="secondary" className="uppercase text-[10px] font-bold">Inactive</Badge>
            case 'draft':
                return <Badge variant="outline" className="uppercase text-[10px] font-bold">Draft</Badge>
            default:
                return <Badge variant="outline" className="capitalize text-[10px] font-bold">{status}</Badge>
        }
    }

    const getResultBadge = (result: string | null | undefined) => {
        switch (result) {
            case 'compliant':
                return (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 px-2 py-1">
                        <CheckCircle className="h-3 w-3 mr-1.5" />
                        Compliant
                    </Badge>
                )
            case 'partial':
                return (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 px-2 py-1">
                        <AlertTriangle className="h-3 w-3 mr-1.5" />
                        Partial
                    </Badge>
                )
            case 'non_compliant':
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 px-2 py-1">
                        <XCircle className="h-3 w-3 mr-1.5" />
                        Non-Compliant
                    </Badge>
                )
            case 'not_applicable':
                return (
                    <Badge variant="secondary" className="px-2 py-1">
                        <MinusCircle className="h-3 w-3 mr-1.5" />
                        N/A
                    </Badge>
                )
            default:
                return <Badge variant="outline" className="text-muted-foreground border-dashed px-2 py-1">Not Assessed</Badge>
        }
    }

    const getEvidenceIcon = (type: string) => {
        switch (type) {
            case 'url': return <LinkIcon className="h-4 w-4" />
            case 'attestation': return <ShieldCheck className="h-4 w-4" />
            default: return <FileText className="h-4 w-4" />
        }
    }

    const complianceStatus = control.compliance_status || null

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'N/A'
        try {
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return 'Invalid Date'
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        } catch (e) {
            return 'Invalid Date'
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-border/50 shadow-sm backdrop-blur-sm">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-2 py-0.5 rounded text-sm font-bold shadow-sm">
                            {control.code}
                        </Badge>
                        {getStatusBadge(control.status)}
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 mb-2">{control.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground mt-2">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 opacity-70" />
                            <span>Created {formatDate(control.created_at)}</span>
                        </div>
                        {control.updated_at && (
                            <div className="flex items-center gap-1.5 border-l pl-4 border-border/50">
                                <History className="h-3.5 w-3.5 opacity-70" />
                                <span>Updated {formatDate(control.updated_at)}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 border-l pl-4 border-border/50">
                            <Building2 className="h-3.5 w-3.5 opacity-70" />
                            <span>{control.category || 'Uncategorized'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 border-l pl-4 border-border/50">
                            <Tag className="h-3.5 w-3.5 opacity-70" />
                            <span>{control.domain?.name || 'No Domain'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.info('Edit functionality coming soon')} className="h-9 font-bold">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Control
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 font-bold text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20" onClick={() => toast.info('Delete functionality coming soon')}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-emerald-500 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Compliance Status</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mt-1">
                            {getResultBadge(complianceStatus)}
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground mt-4 flex items-center gap-1.5">
                            <History className="h-3 w-3 opacity-60" />
                            Latest: {control.tasks?.find(t => t.status === 'completed')?.completed_at ? formatDate(control.tasks.find(t => t.status === 'completed')!.completed_at!) : 'Never'}
                        </p>
                    </CardContent>
                </Card>
                <Card className={`border-l-4 shadow-sm transition-all hover:shadow-md ${(control.max_risk_score || 0) > 15 ? 'border-l-red-500' : (control.max_risk_score || 0) > 5 ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Risk Exposure</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${(control.max_risk_score || 0) > 15 ? 'text-red-500' : (control.max_risk_score || 0) > 5 ? 'text-amber-500' : 'text-blue-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{control.risk_count || 0}</span>
                            <span className="text-sm font-bold text-muted-foreground tracking-tight">Linked Risks</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <Badge variant="outline" className={`font-bold text-[10px] uppercase ${(control.max_risk_score || 0) > 15 ? 'bg-red-50 text-red-700 border-red-200' : (control.max_risk_score || 0) > 5 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                Score: {(control.max_risk_score || 0) > 0 ? control.max_risk_score : '0'}
                            </Badge>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter opacity-70">Highest Impact</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Protected Assets</CardTitle>
                        <Server className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{control.asset_count || 0}</span>
                            <span className="text-sm font-bold text-muted-foreground tracking-tight">Active Assets</span>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground mt-4 flex items-center gap-1.5 uppercase tracking-tighter">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary/70" />
                            Covered by security control
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Information */}
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-4 border-b border-border/40">
                            <CardTitle className="text-lg font-bold">General Information</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div>
                                <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-3">Description</h3>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-border/40">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                        {control.description || 'No description available for this control.'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs Section */}
                    <Tabs defaultValue="evidence" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 h-auto bg-slate-100/50 dark:bg-slate-900/50 p-1 gap-1 mb-6 border border-border/40 rounded-xl">
                            <TabsTrigger value="evidence" className="group py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-lg transition-all">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Evidence</span>
                                    </div>
                                    {(control.evidence?.length || 0) > 0 && <Badge variant="secondary" className="h-4 px-1.5 text-[8px] font-black bg-primary/10 text-primary">{control.evidence?.length}</Badge>}
                                </div>
                            </TabsTrigger>
                            <TabsTrigger value="assets" className="group py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-lg transition-all">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2">
                                        <Server className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Assets</span>
                                    </div>
                                    {(control.asset_count || 0) > 0 && <Badge variant="secondary" className="h-4 px-1.5 text-[8px] font-black bg-primary/10 text-primary">{control.asset_count}</Badge>}
                                </div>
                            </TabsTrigger>
                            <TabsTrigger value="risks" className="group py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-lg transition-all">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Risks</span>
                                    </div>
                                    {(control.risk_count || 0) > 0 && <Badge variant="secondary" className="h-4 px-1.5 text-[8px] font-black bg-primary/10 text-primary">{control.risk_count}</Badge>}
                                </div>
                            </TabsTrigger>
                            <TabsTrigger value="assessments" className="group py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-lg transition-all">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2">
                                        <ClipboardList className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Tasks</span>
                                    </div>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger value="audit_logs" className="group py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-lg transition-all">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2">
                                        <History className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Audit</span>
                                    </div>
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="evidence" className="mt-0 outline-none">
                            <Card className="border-border/50 shadow-sm overflow-hidden">
                                <CardHeader className="px-6 py-5 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base font-bold">Evidence Documents</CardTitle>
                                            <CardDescription className="text-xs font-medium">Verify compliance with supporting artifacts.</CardDescription>
                                        </div>
                                        <AddEvidenceDialog controlId={control.id} onSuccess={onRefresh} />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {(!control.evidence || control.evidence.length === 0) ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-border/50">
                                            <div className="bg-primary/5 p-4 rounded-full mb-4 border border-primary/10">
                                                <FileText className="h-7 w-7 text-primary/60" />
                                            </div>
                                            <h3 className="font-black text-slate-800 dark:text-slate-200">No evidence uploaded</h3>
                                            <p className="text-[11px] font-medium text-muted-foreground mt-2 max-w-[240px] leading-relaxed">
                                                Attach documents or external resources to validate the operational effectiveness of this control.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {control.evidence.map((evidence) => (
                                                <div key={evidence.id} className="group flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-primary/30 transition-all bg-white dark:bg-slate-900/20 shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 rounded-lg bg-primary/5 text-primary border border-primary/10 shadow-sm transition-transform group-hover:scale-105">
                                                            {getEvidenceIcon(evidence.evidence_type)}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{evidence.name || 'Evidence Document'}</p>
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant="secondary" className="text-[9px] font-black uppercase px-1.5 h-4.5 bg-slate-100 dark:bg-slate-800">{evidence.evidence_type}</Badge>
                                                                <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/80">
                                                                    <Calendar className="h-3 w-3 opacity-60" />
                                                                    {formatDate(evidence.created_at)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                                                            onClick={() => handleDownload(evidence.id, evidence.external_url, evidence.file_path)}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="assets" className="mt-0">
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="px-6 py-5 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base font-bold">Linked Assets</CardTitle>
                                            <CardDescription className="text-xs font-medium">Infrastructure protected by this security measure.</CardDescription>
                                        </div>
                                        <Button size="sm" variant="outline" className="font-bold h-8 text-[11px] uppercase tracking-wider">
                                            Link Asset
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ControlAssetList
                                        controlId={control.id}
                                        assets={control.assets || []}
                                        onSuccess={onRefresh}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="risks" className="mt-0">
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="px-6 py-5 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base font-bold">Mitigated Risks</CardTitle>
                                            <CardDescription className="text-xs font-medium">Security vulnerabilities addressed by this control.</CardDescription>
                                        </div>
                                        <Button size="sm" variant="outline" className="font-bold h-8 text-[11px] uppercase tracking-wider">
                                            Map Risk
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ControlRiskList
                                        controlId={control.id}
                                        risks={control.risks || []}
                                        onSuccess={onRefresh}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="assessments" className="mt-0">
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="px-6 py-5 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/50">
                                    <CardTitle className="text-base font-bold">Assessment History</CardTitle>
                                    <CardDescription className="text-xs font-medium">Chronological record of compliance evaluations.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {(!control.tasks || control.tasks.length === 0) ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <ClipboardList className="h-7 w-7 text-muted-foreground/30 mb-3" />
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No evaluation records found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {control.tasks.map((task) => (
                                                <div key={task.id} className="flex items-center justify-between p-4 border border-border/40 rounded-xl bg-white dark:bg-slate-900/20 shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                                                            {task.result === 'compliant' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                                                            {task.result === 'partial' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                                                            {task.result === 'non_compliant' && <XCircle className="h-4 w-4 text-red-600" />}
                                                            {(!task.result || task.result === 'not_applicable') && <ClipboardList className="h-4 w-4 text-muted-foreground" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm">{task.program_name || 'System Task'}</span>
                                                                <Badge variant="outline" className="text-[8px] font-black uppercase px-1.5 h-4.5">{task.status}</Badge>
                                                            </div>
                                                            <div className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-tight opacity-70">
                                                                {task.completed_at ? `Finished ${formatDate(task.completed_at)}` : `Due ${task.due_date ? formatDate(task.due_date) : 'N/A'}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="audit_logs" className="mt-0">
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="px-6 py-5 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/50">
                                    <CardTitle className="text-base font-bold">Audit History</CardTitle>
                                    <CardDescription className="text-xs font-medium">Immutable record of system changes.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <History className="h-7 w-7 text-muted-foreground/20 mb-3" />
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-50">Log synchronization pending</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    {/* Quick Actions Card */}
                    <Card className="shadow-sm border-l-4 border-l-purple-500 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/40">
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Management</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2 pt-4">
                            <AddEvidenceDialog controlId={control.id} onSuccess={onRefresh} />
                            <LinkAssetDialog controlId={control.id} orgId={control.org_id} onSuccess={onRefresh} />
                            <LinkRiskDialog controlId={control.id} orgId={control.org_id} onSuccess={onRefresh} />
                        </CardContent>
                    </Card>

                    {/* Associated Frameworks Card */}
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary/70" />
                                Frameworks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex flex-wrap gap-2">
                                {control.frameworks && control.frameworks.length > 0 ? (
                                    control.frameworks.map((fw, idx) => (
                                        <Badge key={idx} variant="secondary" className="px-2.5 py-1 text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 border-border/50">
                                            {fw.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-xs font-bold text-muted-foreground uppercase opacity-50">Local Control</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Owner Card */}
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <User className="h-4 w-4 text-primary/70" />
                                Ownership
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {control.owner ? (
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-primary/20 p-0.5">
                                        <AvatarImage src={control.owner.avatar_url || ""} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-black">{control.owner.full_name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-900 dark:text-slate-100">{control.owner.full_name}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[150px]">{control.owner.email}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[11px] font-bold text-muted-foreground uppercase italic tracking-wider flex items-center gap-2 opacity-60">
                                    <User className="h-3.5 w-3.5" /> No assignment
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

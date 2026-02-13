
import { Link } from 'react-router'
import {
    ArrowLeft,
    Shield,
    AlertTriangle,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import type { Framework } from '~/lib/api/frameworks'
import { ControlManagementTabs } from './control-management-tabs'
import { useFrameworkControls } from '~/hooks/queries/use-frameworks'
import { Separator } from '~/components/ui/separator'
import { EditFrameworkDialog } from './edit-framework-dialog'
import { DeleteFrameworkDialog } from './delete-framework-dialog'
import { PublishFrameworkButton } from './publish-framework-button'

interface FrameworkDetailViewProps {
    framework: Framework
}

export function FrameworkDetailView({ framework }: FrameworkDetailViewProps) {
    const { data: controls = [] } = useFrameworkControls(framework.id)

    // Calculate stats
    // const riskExposure = controls.reduce((acc, c) => acc + (c.max_risk_score || 0), 0)
    const riskExposure = 0 // Placeholder until risk score is available in Control type
    // Action items: controls that are not 'active' or have specific compliance status issues (if we had that field populated)
    const actionItems = controls.filter(c => c.status !== 'active').length

    return (
        <div className="flex flex-col space-y-8 max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
            {/* Header Navigation */}
            <div className="flex flex-col gap-6">
                <div>
                    <Link to="/frameworks">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 pl-0 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Frameworks
                        </Button>
                    </Link>
                </div>

                {/* Framework Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{framework.name}</h1>
                            <Badge variant="outline" className="font-mono">{framework.version || 'v1.0'}</Badge>
                            <Badge
                                variant={framework.status === 'published' ? 'default' : framework.status === 'archived' ? 'destructive' : 'secondary'}
                                className={`capitalize ${framework.status === 'published' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            >
                                {framework.status || 'draft'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground max-w-2xl text-lg">{framework.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <PublishFrameworkButton framework={framework} />
                        {/* We need to pass trigger prop or specific styled button */}
                        <EditFrameworkDialog framework={framework} />
                        <DeleteFrameworkDialog framework={framework} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="controls" className="w-full">
                <div className="border-b">
                    <TabsList className="w-full justify-start h-10 bg-transparent p-0">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 text-muted-foreground data-[state=active]:text-foreground"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="controls"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 text-muted-foreground data-[state=active]:text-foreground"
                        >
                            Controls ({framework.control_count || 0})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 shadow-sm">
                            <CardHeader>
                                <CardTitle>About this Framework</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none text-muted-foreground">
                                    {framework.description || 'No detailed description available.'}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="space-y-6">
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle>Metadata</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Slug</span>
                                        {/* Slug is potentially missing in Framework type, using name/id as fallback or skipping if undefined */}
                                        <code className="text-xs bg-muted px-2 py-1 rounded">{framework.name.toLowerCase().replace(/\s+/g, '-') || '-'}</code>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Version</span>
                                        <span className="text-sm font-medium">{framework.version || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <span className="text-sm font-medium capitalize">{framework.status}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle>Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Total Controls</span>
                                        <Badge variant="secondary">{framework.control_count || 0}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Adherence</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${framework.progress || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{framework.progress || 0}%</span>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            Risk Exposure
                                        </span>
                                        <span className="text-sm font-medium">{riskExposure}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                            <Shield className="h-3.5 w-3.5" />
                                            Action Items
                                        </span>
                                        <Badge variant={actionItems > 0 ? "destructive" : "outline"}>
                                            {actionItems}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="controls" className="mt-6">
                    <ControlManagementTabs frameworkId={framework.id} />
                </TabsContent>
            </Tabs>
        </div>
    )
}


import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Activity, BarChart3, CheckCircle2, ShieldAlert } from "lucide-react"

interface FrameworksStatsProps {
    totalFrameworks: number
    avgProgress: number
    totalControls: number
    notStarted: number
}

export function FrameworksStats({
    totalFrameworks,
    avgProgress,
    totalControls,
    notStarted,
}: FrameworksStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-xs border-border hover:border-border transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Frameworks</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/20">
                        <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">{totalFrameworks}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Active compliance standards
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-xs border-border hover:border-border transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Adherence</CardTitle>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${avgProgress >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-amber-100 dark:bg-amber-900/20'}`}>
                        <BarChart3 className={`h-4 w-4 ${avgProgress >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">{avgProgress}%</div>
                    <div className="h-1.5 w-full bg-secondary mt-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${avgProgress >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${avgProgress}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-xs border-border hover:border-border transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Controls Mapped</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900/20">
                        <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">{totalControls}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Across all frameworks
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-xs border-border hover:border-border transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Attention Needed</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                        <ShieldAlert className="h-4 w-4 text-destructive" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">{notStarted}</div>
                    <p className="text-xs text-muted-foreground mt-1 text-destructive font-medium">
                        Items require action
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

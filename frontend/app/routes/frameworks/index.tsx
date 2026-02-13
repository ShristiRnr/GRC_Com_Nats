import { useFrameworks } from '~/hooks/queries/use-frameworks'
import { AddFrameworkDialog } from '~/components/frameworks/add-framework-dialog'
import { FrameworksStats } from '~/components/frameworks/frameworks-stats'
import { FrameworksDataTable } from '~/components/frameworks/data-table/data-table'
import { columns } from '~/components/frameworks/data-table/columns'
import { Card } from '~/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function FrameworksPage() {
    const { data: frameworks = [], isLoading, refetch } = useFrameworks()

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Calculate stats
    const totalFrameworks = frameworks.length
    const avgProgress = totalFrameworks > 0
        ? Math.round(frameworks.reduce((acc, f) => acc + (typeof f.progress === 'number' ? f.progress : 0), 0) / (totalFrameworks || 1))
        : 0
    const totalControls = frameworks.reduce((acc, f) => acc + (f.control_count || 0), 0)
    const notStarted = frameworks.filter(f => !f.progress || f.progress === 0).length

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Frameworks</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Manage your compliance standards, track adherence progress, and identify gaps aligned with your business objectives.
                    </p>
                </div>
                <AddFrameworkDialog onSuccess={refetch} />
            </div>

            {/* Stats Overview */}
            <FrameworksStats
                totalFrameworks={totalFrameworks}
                avgProgress={avgProgress}
                totalControls={totalControls}
                notStarted={notStarted}
            />

            {/* Main Content */}
            <Card className="shadow-sm border-border bg-card">
                <div className="p-6">
                    <FrameworksDataTable columns={columns} data={frameworks} />
                </div>
            </Card>
        </div>
    )
}

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { ShieldCheck, CheckCircle, FileEdit, Link2, Layers, AlertCircle } from "lucide-react"

interface ControlsStatsProps {
    totalControls: number
    activeControls: number
    draftControls: number
    mappedControls: number
    uniqueCategories: number
}

export function ControlsStats({
    totalControls,
    activeControls,
    draftControls,
    mappedControls,
    uniqueCategories,
}: ControlsStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 animate-in fade-in duration-700">
            <Card className="shadow-sm border-border/60 hover:border-primary/20 transition-all hover:shadow-md bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Controls</CardTitle>
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black tracking-tight text-foreground">{totalControls}</div>
                    <p className="text-[11px] font-bold text-muted-foreground mt-1 flex items-center gap-1">
                        <div className="size-1 rounded-full bg-primary" />
                        In library
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-border/60 hover:border-emerald-200 transition-all hover:shadow-md bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active</CardTitle>
                    <div className="size-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black tracking-tight text-foreground">{activeControls}</div>
                    <p className="text-[11px] font-bold text-muted-foreground mt-1 flex items-center gap-1">
                        <div className="size-1 rounded-full bg-emerald-500" />
                        Operational
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-border/60 hover:border-amber-200 transition-all hover:shadow-md bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Draft</CardTitle>
                    <div className="size-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                        <FileEdit className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black tracking-tight text-foreground">{draftControls}</div>
                    <p className="text-[11px] font-bold text-muted-foreground mt-1 flex items-center gap-1">
                        <div className="size-1 rounded-full bg-amber-500" />
                        Pending review
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-border/60 hover:border-blue-200 transition-all hover:shadow-md bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mapped</CardTitle>
                    <div className="size-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                        <Link2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black tracking-tight text-foreground">{mappedControls}</div>
                    <p className="text-[11px] font-bold text-muted-foreground mt-1 flex items-center gap-1">
                        <div className="size-1 rounded-full bg-blue-500" />
                        To frameworks
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-border/60 hover:border-violet-200 transition-all hover:shadow-md bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Taxonomy</CardTitle>
                    <div className="size-8 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 shadow-inner">
                        <Layers className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black tracking-tight text-foreground">{uniqueCategories}</div>
                    <p className="text-[11px] font-bold text-muted-foreground mt-1 flex items-center gap-1">
                        <div className="size-1 rounded-full bg-violet-500" />
                        Control categories
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

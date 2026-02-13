import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Label
} from "recharts";
import { AlertTriangle, Shield, LayoutGrid, Server } from "lucide-react";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig
} from "~/components/ui/chart";
import type { Control } from "~/lib/api/frameworks";

interface FrameworkStatsBoardProps {
    controls: Control[];
}

export function FrameworkStatsBoard({ controls }: FrameworkStatsBoardProps) {
    // 1. Compliance Data for Donut Chart
    const complianceData = [
        { status: 'compliant', count: controls.filter(c => c.compliance_status === 'compliant').length, fill: "#10b981" },
        { status: 'partial', count: controls.filter(c => c.compliance_status === 'partial').length, fill: "#f59e0b" },
        { status: 'non_compliant', count: controls.filter(c => c.compliance_status === 'non_compliant').length, fill: "#ef4444" },
        { status: 'unknown', count: controls.filter(c => !c.compliance_status || c.compliance_status === 'not_assessed').length, fill: "#94a3b8" },
    ].filter(d => d.count > 0);

    const complianceConfig = {
        count: {
            label: "Controls",
        },
        compliant: {
            label: "Compliant",
            color: "#10b981",
        },
        partial: {
            label: "Partial",
            color: "#f59e0b",
        },
        non_compliant: {
            label: "Non-Compliant",
            color: "#ef4444",
        },
        unknown: {
            label: "Not Assessed",
            color: "#94a3b8",
        },
    } satisfies ChartConfig;

    // 2. Risk Severity Data for Stacked Bar
    const riskBuckets = controls.reduce((acc: any, c) => {
        // Simple logic for demo, in real app this would come from backend response
        const risks = c.risk_count || 0;
        if (risks === 0) return acc;
        acc.medium += risks; // simplified
        return acc;
    }, { low: 0, medium: 0, high: 0, critical: 0 });

    const riskChartData = [
        { name: 'Low', count: riskBuckets.low, fill: "#3b82f6" },
        { name: 'Medium', count: riskBuckets.medium, fill: "#f97316" },
        { name: 'High', count: riskBuckets.high, fill: "#ef4444" },
        { name: 'Critical', count: riskBuckets.critical, fill: "#991b1b" },
    ];

    const riskConfig = {
        low: {
            label: "Low Risk",
            color: "#3b82f6",
        },
        medium: {
            label: "Medium Risk",
            color: "#f97316",
        },
        high: {
            label: "High Risk",
            color: "#ef4444",
        },
        critical: {
            label: "Critical Risk",
            color: "#991b1b",
        },
    } satisfies ChartConfig;

    // 3. Metrics
    const totalAssets = controls.reduce((acc, c) => acc + (c.asset_count || 0), 0);
    const uniqueCategories = new Set(controls.map(c => c.category).filter(Boolean)).size;
    const totalRisks = riskBuckets.critical + riskBuckets.high + riskBuckets.medium + riskBuckets.low;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Mapped Controls</CardTitle>
                    <Shield className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{controls.length}</div>
                    <p className="text-xs text-muted-foreground">Framework scope</p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
                    <LayoutGrid className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{uniqueCategories}</div>
                    <p className="text-xs text-muted-foreground">Structural units</p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Assets in Scope</CardTitle>
                    <Server className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalAssets}</div>
                    <p className="text-xs text-muted-foreground">Connected assets</p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Risk Exposure</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalRisks}</div>
                    <p className="text-xs text-muted-foreground">Identified risks</p>
                </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2 shadow-sm flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle className="text-sm font-medium">Compliance Health</CardTitle>
                    <CardDescription>Adherence status breakdown</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0 min-h-[300px]">
                    {complianceData.length > 0 ? (
                        <ChartContainer config={complianceConfig} className="mx-auto aspect-square h-[250px] w-full mt-4">
                            <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie
                                    data={complianceData}
                                    dataKey="count"
                                    nameKey="status"
                                    innerRadius={60}
                                    strokeWidth={5}
                                >
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                    >
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            className="fill-foreground text-3xl font-bold"
                                                        >
                                                            {controls.length}
                                                        </tspan>
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={(viewBox.cy || 0) + 24}
                                                            className="fill-muted-foreground text-xs"
                                                        >
                                                            Controls
                                                        </tspan>
                                                    </text>
                                                )
                                            }
                                        }}
                                    />
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="status" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
                            </PieChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center space-y-2 h-full opacity-50 min-h-[250px]">
                            <div className="rounded-full bg-muted p-4">
                                <Shield className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="text-sm font-medium">No compliance data</div>
                            <div className="text-xs text-muted-foreground">Controls must be assessed to see stats</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2 shadow-sm flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle className="text-sm font-medium">Risk Distribution</CardTitle>
                    <CardDescription>Severity analysis by severity level</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0 min-h-[300px]">
                    {totalRisks > 0 ? (
                        <ChartContainer config={riskConfig} className="mx-auto aspect-[4/3] h-[250px] w-full mt-4">
                            <BarChart
                                data={riskChartData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                barSize={40}
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    fontSize={12}
                                />
                                <YAxis hide />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {riskChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center space-y-2 h-full opacity-50 min-h-[250px]">
                            <div className="rounded-full bg-muted p-4">
                                <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="text-sm font-medium">No risk data</div>
                            <div className="text-xs text-muted-foreground">Add risks to mapped controls</div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

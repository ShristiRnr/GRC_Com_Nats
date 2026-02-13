"use client";

import { useRiskStats } from "~/hooks/queries/use-risks";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertTriangle, ShieldCheck, TrendingDown, Activity } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function RiskStats({ orgId }: { orgId: string }) {
    const { data: stats, isLoading } = useRiskStats(orgId);

    if (isLoading) {
        return <StatsSkeleton />;
    }

    // Calculate percentages
    const total = stats?.total_count || 1;
    const criticalPercent = Math.round(
        ((stats?.critical_risk_count || 0) / total) * 100
    );
    const highPercent = Math.round(
        ((stats?.high_risk_count || 0) / total) * 100
    );

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.total_count || 0}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats?.identified_count} identified, {stats?.mitigating_count} mitigating
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical Risks</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        {stats?.critical_risk_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {criticalPercent}% of total risks
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">High Risks</CardTitle>
                    <TrendingDown className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                        {stats?.high_risk_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {highPercent}% of total risks
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mitigated</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {stats?.mitigated_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Controls effectively implementing
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

function StatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-[60px] mb-2" />
                        <Skeleton className="h-3 w-[120px]" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

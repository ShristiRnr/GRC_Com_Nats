import { Link } from "react-router"; // Use react-router Link
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "~/lib/utils";

interface MetricCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: React.ElementType;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    color?: "primary" | "green" | "orange" | "red" | "purple" | "gray" | "blue";
    href?: string;
    onClick?: () => void;
    className?: string;
}

export function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    color = "primary",
    href,
    onClick,
    className,
}: MetricCardProps) {
    const colorClasses: Record<string, { border: string; icon: string; title: string; value: string; badge: string; ring: string }> = {
        primary: {
            border: "border-l-primary",
            icon: "bg-primary text-white shadow-md shadow-red-200 dark:shadow-red-900/20",
            title: "text-muted-foreground",
            value: "text-foreground",
            badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
            ring: "group-hover:ring-red-100 dark:group-hover:ring-red-900/30",
        },
        green: {
            border: "border-l-emerald-500",
            icon: "bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/20",
            title: "text-muted-foreground",
            value: "text-foreground",
            badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
            ring: "group-hover:ring-emerald-100 dark:group-hover:ring-emerald-900/30",
        },
        orange: {
            border: "border-l-amber-500",
            icon: "bg-amber-500 text-white shadow-md shadow-amber-200 dark:shadow-amber-900/20",
            title: "text-muted-foreground",
            value: "text-foreground",
            badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
            ring: "group-hover:ring-amber-100 dark:group-hover:ring-amber-900/30",
        },
        red: {
            border: "border-l-rose-500",
            icon: "bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-rose-900/20",
            title: "text-muted-foreground",
            value: "text-foreground",
            badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
            ring: "group-hover:ring-rose-100 dark:group-hover:ring-rose-900/30",
        },
        purple: {
            border: "border-l-violet-500",
            icon: "bg-violet-500 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/20",
            title: "text-muted-foreground",
            value: "text-foreground",
            badge: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
            ring: "group-hover:ring-violet-100 dark:group-hover:ring-violet-900/30",
        },
        blue: {
            border: "border-l-blue-500",
            icon: "bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20",
            title: "text-muted-foreground",
            value: "text-foreground",
            badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
            ring: "group-hover:ring-blue-100 dark:group-hover:ring-blue-900/30",
        },
        gray: {
            border: "border-l-slate-500",
            icon: "bg-slate-500 text-white shadow-md shadow-slate-200 dark:shadow-slate-900/20",
            title: "text-muted-foreground",
            value: "text-foreground",
            badge: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800",
            ring: "group-hover:ring-slate-100 dark:group-hover:ring-slate-900/30",
        },
    };

    const c = colorClasses[color] || colorClasses.primary;

    return (
        <Card
            className={cn(
                `group relative bg-card shadow-sm hover:shadow-lg transition-all duration-300 border border-border ${c.border} border-l-4`,
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                        <p className={cn("text-xs font-bold uppercase tracking-wider", c.title)}>
                            {title}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className={cn("text-3xl font-extrabold tracking-tight", c.value)}>{value}</span>
                        </div>
                    </div>
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300", c.icon)}>
                        <Icon className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {subtitle && (
                        <p className="text-xs text-muted-foreground font-medium truncate max-w-[140px]">{subtitle}</p>
                    )}

                    {trend && trendValue && (
                        <Badge
                            variant="outline"
                            className={cn("text-[10px] font-semibold px-1.5 py-0.5 h-5 flex items-center gap-1", c.badge)}
                        >
                            {trend === "up" ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : trend === "down" ? (
                                <TrendingDown className="h-3 w-3" />
                            ) : null}
                            {trendValue}
                        </Badge>
                    )}
                </div>

                {href && (
                    <Link
                        to={href} // React router uses 'to'
                        className="absolute inset-0"
                        aria-label={`View details for ${title}`}
                    />
                )}
            </CardContent>
        </Card>
    );
}

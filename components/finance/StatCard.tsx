import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon, ArrowUp, ArrowDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    value: string | number
    icon?: LucideIcon
    trend?: number
    trendLabel?: string
    className?: string
    description?: string
}

export function StatCard({
    title,
    value,
    icon: Icon = TrendingUp,
    trend,
    trendLabel,
    className,
    description,
}: StatCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(trend !== undefined || description) && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {trend !== undefined && (
                            <span className={cn("flex items-center", trend > 0 ? "text-emerald-500" : trend < 0 ? "text-red-500" : "")}>
                                {trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                {Math.abs(trend)}%
                            </span>
                        )}
                        {trendLabel || description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

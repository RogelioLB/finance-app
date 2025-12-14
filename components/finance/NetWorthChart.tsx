"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTheme } from "next-themes"

const data = [
    { month: "Jan", amount: 4000 },
    { month: "Feb", amount: 4500 },
    { month: "Mar", amount: 4200 },
    { month: "Apr", amount: 4800 },
    { month: "May", amount: 5000 },
    { month: "Jun", amount: 5500 },
    { month: "Jul", amount: 5300 },
    { month: "Aug", amount: 6000 },
    { month: "Sep", amount: 6200 },
    { month: "Oct", amount: 6800 },
    { month: "Nov", amount: 7200 },
    { month: "Dec", amount: 7800 },
]

export function NetWorthChart() {
    const { theme } = useTheme()
    const isDark = theme === "dark"

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: isDark ? "#1e293b" : "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        itemStyle={{ color: "#6366f1" }}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

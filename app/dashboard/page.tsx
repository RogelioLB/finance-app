import { getUserDashboardData } from "@/lib/actions/user"
import { getTransactionData } from "@/lib/actions/transactions" // Need data for the form
import { StatCard } from "@/components/finance/StatCard"
import { NetWorthChart } from "@/components/finance/NetWorthChart"
import { TransactionCard } from "@/components/finance/TransactionCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, PiggyBank, TrendingUp, Wallet, Store } from "lucide-react"
import { AddTransactionSheet } from "@/components/finance/AddTransactionSheet"

export default async function DashboardPage() {
    // Fetch user dashboard data AND transaction form data in parallel
    const [dashboardData, transactionData] = await Promise.all([
        getUserDashboardData(),
        getTransactionData()
    ])

    if (!dashboardData) {
        return null
    }

    const { user, netWorth, recentTransactions } = dashboardData
    const { accounts, categories } = transactionData

    // Safety checks for undefined values
    const netWorthValue = netWorth?.toLocaleString() || "0.00"
    const userName = user.name?.split(' ')[0] || "User"
    const txList = recentTransactions || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Good morning, {userName}</h1>
                    <p className="text-muted-foreground">Here's what's happening with your money today.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Download Report</Button>
                    {/* Add Transaction Button Component */}
                    <AddTransactionSheet accounts={accounts} categories={categories} />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Net Worth"
                    value={`$${netWorthValue}`}
                    icon={Wallet}
                    trend={12.5}
                    trendLabel="from last month"
                />
                <StatCard
                    title="Monthly Income"
                    value="$0.00"
                    icon={DollarSign}
                    trend={0}
                    trendLabel="vs last month"
                />
                <StatCard
                    title="Savings Rate"
                    value="0%"
                    icon={PiggyBank}
                    trend={0}
                    trendLabel="target 30%"
                />
                <StatCard
                    title="Daily Growth"
                    value="+$0.00"
                    icon={TrendingUp}
                    description="Interest & Investments"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* Main Chart */}
                <Card className="col-span-4 lg:col-span-5">
                    <CardHeader>
                        <CardTitle>Net Worth Growth</CardTitle>
                        <CardDescription>Your financial trajectory over the last 12 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <NetWorthChart />
                    </CardContent>
                </Card>

                {/* Projections & Transactions */}
                <div className="col-span-3 lg:col-span-2 space-y-6">
                    {/* Projections */}
                    <Card className="bg-linear-to-br from-indigo-900 to-slate-900 text-white border-none">
                        <CardHeader>
                            <CardTitle className="text-indigo-100">Projected Wealth</CardTitle>
                            <CardDescription className="text-indigo-200/70">In 5 Years</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold mb-2">$0</div>
                            <p className="text-xs text-indigo-300">Based on your current savings trend.</p>
                        </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {txList.length === 0 ? (
                                <p className="text-sm text-muted-foreground p-4">No recent transactions.</p>
                            ) : (
                                txList.map((tx: any) => (
                                    <TransactionCard
                                        key={tx.id}
                                        payee={tx.description || "Unknown"}
                                        amount={Number(tx.amount)}
                                        date={new Date(tx.date).toLocaleDateString()}
                                        category={tx.category?.name || "Uncategorized"}
                                        icon={Store}
                                        type={tx.type === 'EXPENSE' ? 'expense' : 'income'}
                                        className="border-b rounded-none px-0 py-3 last:border-0"
                                    />
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    )
}

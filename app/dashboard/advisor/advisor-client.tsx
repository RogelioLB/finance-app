"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    AlertTriangle,
    Lightbulb,
    Target,
    Trophy,
    TrendingUp,
    TrendingDown,
    Clock,
    DollarSign,
    Wallet,
    CreditCard,
    PiggyBank,
    CalendarDays,
    ArrowRight,
    Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DebtAnalysis {
    id: string
    name: string
    totalAmount: number
    remainingAmount: number
    interestRate: number | null
    minimumPayment: number | null
    dueDate: number | null
    accountName: string | null
    paidAmount: number
    paidPercentage: number
    paymentsRemaining: number | null
    monthsToPayOff: number | null
    totalInterestCost: number | null
    suggestedPayment: number | null
}

interface GoalAnalysis {
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    deadline: Date | null
    color: string | null
    remainingAmount: number
    progress: number
    monthsRemaining: number | null
    requiredMonthlySaving: number | null
    onTrack: boolean | null
    projectedCompletionDate: Date | null
}

interface FinancialSummary {
    netWorth: number
    totalAssets: number
    totalLiabilities: number
    monthlyIncome: number
    monthlyExpenses: number
    monthlyNetCashflow: number
    savingsRate: number
    totalDebt: number
    totalMinimumPayments: number
    debtToIncomeRatio: number
    totalGoalsTarget: number
    totalGoalsSaved: number
    goalsProgress: number
    monthlySubscriptions: number
}

interface FinancialAdvice {
    type: 'warning' | 'tip' | 'goal' | 'achievement'
    priority: 'high' | 'medium' | 'low'
    title: string
    message: string
    action?: string
}

interface AdvisorClientProps {
    summary: FinancialSummary
    debts: DebtAnalysis[]
    goals: GoalAnalysis[]
    advice: FinancialAdvice[]
    projectedNetWorth: {
        oneYear: number
        threeYears: number
        fiveYears: number
    }
}

function formatCurrency(value: number): string {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatMonths(months: number): string {
    if (months < 12) {
        return `${months} month${months !== 1 ? 's' : ''}`
    }
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`
    }
    return `${years}y ${remainingMonths}m`
}

const adviceIcons = {
    warning: AlertTriangle,
    tip: Lightbulb,
    goal: Target,
    achievement: Trophy
}

const adviceColors = {
    warning: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    tip: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    goal: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200',
    achievement: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
}

export function AdvisorClient({ summary, debts, goals, advice, projectedNetWorth }: AdvisorClientProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-8 w-8 text-indigo-500" />
                    <h1 className="text-3xl font-bold tracking-tight">Financial Advisor</h1>
                </div>
                <p className="text-muted-foreground">Your personalized financial insights and action plan.</p>
            </div>

            {/* Financial Health Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className={cn(
                    "border-l-4",
                    summary.netWorth >= 0 ? "border-l-emerald-500" : "border-l-red-500"
                )}>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1">
                            <Wallet className="h-4 w-4" />
                            Net Worth
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-2xl font-bold",
                            summary.netWorth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        )}>
                            {formatCurrency(summary.netWorth)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Assets: {formatCurrency(summary.totalAssets)} | Liabilities: {formatCurrency(summary.totalLiabilities)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            Monthly Cashflow
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-2xl font-bold",
                            summary.monthlyNetCashflow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        )}>
                            {summary.monthlyNetCashflow >= 0 ? '+' : ''}{formatCurrency(summary.monthlyNetCashflow)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Income: {formatCurrency(summary.monthlyIncome)} | Expenses: {formatCurrency(summary.monthlyExpenses)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1">
                            <PiggyBank className="h-4 w-4" />
                            Savings Rate
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-2xl font-bold",
                            summary.savingsRate >= 20 ? "text-emerald-600 dark:text-emerald-400" :
                            summary.savingsRate >= 10 ? "text-amber-600 dark:text-amber-400" :
                            "text-red-600 dark:text-red-400"
                        )}>
                            {summary.savingsRate.toFixed(1)}%
                        </div>
                        <Progress
                            value={Math.min(summary.savingsRate, 100)}
                            className="h-2 mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Target: 20%+</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            Debt-to-Income
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-2xl font-bold",
                            summary.debtToIncomeRatio <= 0.36 ? "text-emerald-600 dark:text-emerald-400" :
                            summary.debtToIncomeRatio <= 0.5 ? "text-amber-600 dark:text-amber-400" :
                            "text-red-600 dark:text-red-400"
                        )}>
                            {(summary.debtToIncomeRatio * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(summary.totalMinimumPayments)}/mo in payments
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Advice Section */}
            {advice.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-500" />
                            Personalized Recommendations
                        </CardTitle>
                        <CardDescription>Action items to improve your financial health</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {advice.map((item, index) => {
                            const Icon = adviceIcons[item.type]
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn(
                                        "p-4 rounded-lg border",
                                        adviceColors[item.type]
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold">{item.title}</h4>
                                                <Badge variant="outline" className="text-[10px]">
                                                    {item.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-sm opacity-90">{item.message}</p>
                                            {item.action && (
                                                <div className="flex items-center gap-1 mt-2 text-sm font-medium">
                                                    <ArrowRight className="h-4 w-4" />
                                                    {item.action}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Debt Payoff Plan */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-red-500" />
                            Debt Payoff Plan
                        </CardTitle>
                        <CardDescription>
                            Total Debt: {formatCurrency(summary.totalDebt)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {debts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Trophy className="h-12 w-12 mx-auto mb-2 text-emerald-500" />
                                <p className="font-medium text-foreground">Debt Free!</p>
                                <p className="text-sm">You have no tracked debts.</p>
                            </div>
                        ) : (
                            debts.map((debt) => (
                                <div key={debt.id} className="p-4 rounded-lg bg-muted/50 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold">{debt.name}</h4>
                                            {debt.accountName && (
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <CreditCard className="h-3 w-3" />
                                                    {debt.accountName}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-red-600 dark:text-red-400">
                                                {formatCurrency(debt.remainingAmount)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                of {formatCurrency(debt.totalAmount)}
                                            </p>
                                        </div>
                                    </div>

                                    <Progress value={debt.paidPercentage} className="h-2" />

                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div className="bg-background rounded p-2">
                                            <p className="text-muted-foreground text-xs">Paid</p>
                                            <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                {debt.paidPercentage.toFixed(0)}%
                                            </p>
                                        </div>
                                        <div className="bg-background rounded p-2">
                                            <p className="text-muted-foreground text-xs">Payments Left</p>
                                            <p className="font-semibold">
                                                {debt.paymentsRemaining !== null ? debt.paymentsRemaining : '-'}
                                            </p>
                                        </div>
                                        <div className="bg-background rounded p-2">
                                            <p className="text-muted-foreground text-xs">Time Left</p>
                                            <p className="font-semibold">
                                                {debt.monthsToPayOff !== null ? formatMonths(debt.monthsToPayOff) : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {(debt.minimumPayment || debt.interestRate) && (
                                        <div className="flex gap-4 text-xs pt-2 border-t">
                                            {debt.minimumPayment && (
                                                <div>
                                                    <span className="text-muted-foreground">Payment: </span>
                                                    <span className="font-medium">{formatCurrency(debt.minimumPayment)}/mo</span>
                                                </div>
                                            )}
                                            {debt.interestRate && (
                                                <div>
                                                    <span className="text-muted-foreground">Interest: </span>
                                                    <span className="font-medium">{debt.interestRate}%</span>
                                                </div>
                                            )}
                                            {debt.totalInterestCost !== null && debt.totalInterestCost > 0 && (
                                                <div>
                                                    <span className="text-muted-foreground">Total Interest: </span>
                                                    <span className="font-medium text-amber-600 dark:text-amber-400">
                                                        {formatCurrency(debt.totalInterestCost)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Goals Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-indigo-500" />
                            Savings Goals
                        </CardTitle>
                        <CardDescription>
                            Progress: {formatCurrency(summary.totalGoalsSaved)} of {formatCurrency(summary.totalGoalsTarget)} ({summary.goalsProgress.toFixed(0)}%)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {goals.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Target className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                                <p className="font-medium text-foreground">No Goals Yet</p>
                                <p className="text-sm">Create a savings goal to get started.</p>
                            </div>
                        ) : (
                            goals.map((goal) => (
                                <div key={goal.id} className="p-4 rounded-lg bg-muted/50 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold">{goal.name}</h4>
                                                {goal.onTrack !== null && (
                                                    <Badge variant={goal.onTrack ? "default" : "destructive"} className="text-[10px]">
                                                        {goal.onTrack ? "On Track" : "Behind"}
                                                    </Badge>
                                                )}
                                            </div>
                                            {goal.deadline && (
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <CalendarDays className="h-3 w-3" />
                                                    {new Date(goal.deadline).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-indigo-600 dark:text-indigo-400">
                                                {formatCurrency(goal.currentAmount)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                of {formatCurrency(goal.targetAmount)}
                                            </p>
                                        </div>
                                    </div>

                                    <Progress value={goal.progress} className="h-2" />

                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div className="bg-background rounded p-2">
                                            <p className="text-muted-foreground text-xs">Progress</p>
                                            <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                {goal.progress.toFixed(0)}%
                                            </p>
                                        </div>
                                        <div className="bg-background rounded p-2">
                                            <p className="text-muted-foreground text-xs">Remaining</p>
                                            <p className="font-semibold">
                                                {formatCurrency(goal.remainingAmount)}
                                            </p>
                                        </div>
                                        <div className="bg-background rounded p-2">
                                            <p className="text-muted-foreground text-xs">Months Left</p>
                                            <p className="font-semibold">
                                                {goal.monthsRemaining !== null ? goal.monthsRemaining : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {goal.requiredMonthlySaving !== null && (
                                        <div className="flex items-center justify-center gap-2 pt-2 border-t">
                                            <DollarSign className="h-4 w-4 text-emerald-500" />
                                            <span className="text-sm">
                                                Save <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatCurrency(goal.requiredMonthlySaving)}
                                                </span> per month to reach your goal
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Projections */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-500" />
                        Wealth Projections
                    </CardTitle>
                    <CardDescription>
                        Based on your current savings rate and 7% annual returns
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">1 Year</p>
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(projectedNetWorth.oneYear)}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">3 Years</p>
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(projectedNetWorth.threeYears)}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">5 Years</p>
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(projectedNetWorth.fiveYears)}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                        * Projections assume consistent monthly savings of {formatCurrency(summary.monthlyNetCashflow)} and average market returns. Actual results may vary.
                    </p>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Monthly Commitments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Debt Payments</span>
                                <span className="font-medium">{formatCurrency(summary.totalMinimumPayments)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subscriptions</span>
                                <span className="font-medium">{formatCurrency(summary.monthlySubscriptions)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t font-semibold">
                                <span>Total Fixed</span>
                                <span>{formatCurrency(summary.totalMinimumPayments + summary.monthlySubscriptions)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Disposable Income
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Monthly Income</span>
                                <span className="font-medium">{formatCurrency(summary.monthlyIncome)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fixed Expenses</span>
                                <span className="font-medium text-red-600 dark:text-red-400">
                                    -{formatCurrency(summary.monthlyExpenses)}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t font-semibold">
                                <span>Available</span>
                                <span className={summary.monthlyNetCashflow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                                    {formatCurrency(summary.monthlyNetCashflow)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    )
}

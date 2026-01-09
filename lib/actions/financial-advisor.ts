"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma"

// Types for financial calculations
interface DebtAnalysis {
    id: string
    name: string
    totalAmount: number
    remainingAmount: number
    interestRate: number | null
    minimumPayment: number | null
    dueDate: number | null
    accountName: string | null
    // Calculated fields
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
    // Calculated fields
    remainingAmount: number
    progress: number
    monthsRemaining: number | null
    requiredMonthlySaving: number | null
    onTrack: boolean | null
    projectedCompletionDate: Date | null
}

interface FinancialSummary {
    // Net Worth
    netWorth: number
    totalAssets: number
    totalLiabilities: number

    // Income/Expenses
    monthlyIncome: number
    monthlyExpenses: number
    monthlyNetCashflow: number
    savingsRate: number

    // Debts Summary
    totalDebt: number
    totalMinimumPayments: number
    debtToIncomeRatio: number

    // Goals Summary
    totalGoalsTarget: number
    totalGoalsSaved: number
    goalsProgress: number

    // Subscriptions
    monthlySubscriptions: number
}

interface FinancialAdvice {
    type: 'warning' | 'tip' | 'goal' | 'achievement'
    priority: 'high' | 'medium' | 'low'
    title: string
    message: string
    action?: string
}

interface FinancialAdvisorData {
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

// Calculate debt payoff details
function calculateDebtPayoff(
    remainingAmount: number,
    interestRate: number | null,
    minimumPayment: number | null
): { monthsToPayOff: number | null; totalInterestCost: number | null; suggestedPayment: number | null } {
    if (!minimumPayment || minimumPayment <= 0) {
        return { monthsToPayOff: null, totalInterestCost: null, suggestedPayment: null }
    }

    // If no interest, simple calculation
    if (!interestRate || interestRate === 0) {
        return {
            monthsToPayOff: Math.ceil(remainingAmount / minimumPayment),
            totalInterestCost: 0,
            suggestedPayment: minimumPayment
        }
    }

    // Monthly interest rate
    const monthlyRate = interestRate / 100 / 12
    let balance = remainingAmount
    let months = 0
    let totalPaid = 0
    const maxMonths = 360 // 30 years max

    // Amortization calculation
    while (balance > 0 && months < maxMonths) {
        const interestCharge = balance * monthlyRate
        const principalPayment = Math.min(minimumPayment - interestCharge, balance)

        if (principalPayment <= 0) {
            // Minimum payment doesn't cover interest
            return { monthsToPayOff: null, totalInterestCost: null, suggestedPayment: interestCharge * 1.5 }
        }

        balance -= principalPayment
        totalPaid += minimumPayment
        months++
    }

    if (balance > 0) {
        return { monthsToPayOff: null, totalInterestCost: null, suggestedPayment: minimumPayment * 2 }
    }

    return {
        monthsToPayOff: months,
        totalInterestCost: totalPaid - remainingAmount,
        suggestedPayment: minimumPayment
    }
}

// Calculate goal progress and requirements
function calculateGoalProgress(
    targetAmount: number,
    currentAmount: number,
    deadline: Date | null
): { remainingAmount: number; monthsRemaining: number | null; requiredMonthlySaving: number | null; onTrack: boolean | null; projectedCompletionDate: Date | null } {
    const remainingAmount = targetAmount - currentAmount

    if (!deadline) {
        return {
            remainingAmount,
            monthsRemaining: null,
            requiredMonthlySaving: null,
            onTrack: null,
            projectedCompletionDate: null
        }
    }

    const now = new Date()
    const monthsRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)))

    if (monthsRemaining === 0) {
        return {
            remainingAmount,
            monthsRemaining: 0,
            requiredMonthlySaving: remainingAmount,
            onTrack: currentAmount >= targetAmount,
            projectedCompletionDate: currentAmount >= targetAmount ? now : null
        }
    }

    const requiredMonthlySaving = remainingAmount / monthsRemaining

    return {
        remainingAmount,
        monthsRemaining,
        requiredMonthlySaving,
        onTrack: requiredMonthlySaving <= (targetAmount / 12), // If required is less than 1/12 of target, we're on track
        projectedCompletionDate: deadline
    }
}

// Generate financial advice
function generateAdvice(
    summary: FinancialSummary,
    debts: DebtAnalysis[],
    goals: GoalAnalysis[]
): FinancialAdvice[] {
    const advice: FinancialAdvice[] = []

    // Emergency Fund Check
    const hasEmergencyGoal = goals.some(g =>
        g.name.toLowerCase().includes('emergencia') ||
        g.name.toLowerCase().includes('emergency')
    )
    if (!hasEmergencyGoal && summary.monthlyExpenses > 0) {
        advice.push({
            type: 'tip',
            priority: 'high',
            title: 'Create Emergency Fund',
            message: `You should have 3-6 months of expenses saved ($${(summary.monthlyExpenses * 3).toLocaleString()} - $${(summary.monthlyExpenses * 6).toLocaleString()}).`,
            action: 'Create a goal called "Emergency Fund"'
        })
    }

    // High Debt Warning
    if (summary.debtToIncomeRatio > 0.4) {
        advice.push({
            type: 'warning',
            priority: 'high',
            title: 'High Debt Ratio',
            message: `Your debt-to-income ratio is ${(summary.debtToIncomeRatio * 100).toFixed(1)}%. Aim for below 36%.`,
            action: 'Focus on paying down high-interest debts first'
        })
    }

    // Savings Rate
    if (summary.savingsRate < 10 && summary.monthlyIncome > 0) {
        advice.push({
            type: 'warning',
            priority: 'medium',
            title: 'Low Savings Rate',
            message: `You're saving only ${summary.savingsRate.toFixed(1)}% of income. Try to save at least 20%.`,
            action: `Save $${((summary.monthlyIncome * 0.2) - (summary.monthlyIncome - summary.monthlyExpenses)).toFixed(0)} more per month`
        })
    } else if (summary.savingsRate >= 20) {
        advice.push({
            type: 'achievement',
            priority: 'low',
            title: 'Great Savings!',
            message: `You're saving ${summary.savingsRate.toFixed(1)}% of your income. Keep it up!`
        })
    }

    // High Interest Debts
    const highInterestDebts = debts.filter(d => d.interestRate && d.interestRate > 15)
    if (highInterestDebts.length > 0) {
        const totalHighInterest = highInterestDebts.reduce((sum, d) => sum + d.remainingAmount, 0)
        advice.push({
            type: 'warning',
            priority: 'high',
            title: 'High Interest Debts',
            message: `You have $${totalHighInterest.toLocaleString()} in debts with >15% interest. These cost you money every month.`,
            action: 'Prioritize paying these debts first (Avalanche Method)'
        })
    }

    // Goals Progress
    const behindGoals = goals.filter(g => g.onTrack === false)
    if (behindGoals.length > 0) {
        behindGoals.forEach(goal => {
            advice.push({
                type: 'goal',
                priority: 'medium',
                title: `"${goal.name}" Needs Attention`,
                message: `You need to save $${goal.requiredMonthlySaving?.toLocaleString()} monthly to reach your goal by the deadline.`,
                action: 'Increase monthly contributions or extend deadline'
            })
        })
    }

    // Subscription Check
    if (summary.monthlySubscriptions > summary.monthlyIncome * 0.1) {
        advice.push({
            type: 'tip',
            priority: 'medium',
            title: 'Review Subscriptions',
            message: `Subscriptions cost $${summary.monthlySubscriptions.toLocaleString()}/month (${((summary.monthlySubscriptions / summary.monthlyIncome) * 100).toFixed(1)}% of income). Consider if all are necessary.`
        })
    }

    // Positive Net Worth
    if (summary.netWorth > 0 && summary.totalDebt === 0) {
        advice.push({
            type: 'achievement',
            priority: 'low',
            title: 'Debt Free!',
            message: `Congratulations! You have no debts. Focus on building wealth through investments.`
        })
    }

    return advice.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
}

// Calculate projected net worth
function calculateProjectedNetWorth(
    currentNetWorth: number,
    monthlyNetCashflow: number,
    annualReturnRate: number = 0.07 // 7% average market return
): { oneYear: number; threeYears: number; fiveYears: number } {
    const monthlyReturn = annualReturnRate / 12

    function futureValue(months: number): number {
        let value = currentNetWorth
        for (let i = 0; i < months; i++) {
            value = value * (1 + monthlyReturn) + monthlyNetCashflow
        }
        return value
    }

    return {
        oneYear: Math.round(futureValue(12)),
        threeYears: Math.round(futureValue(36)),
        fiveYears: Math.round(futureValue(60))
    }
}

export async function getFinancialAdvisorData(): Promise<FinancialAdvisorData | null> {
    const user = await currentUser()
    if (!user) return null

    // Check if user exists in DB
    const dbUser = await db.user.findUnique({
        where: { id: user.id }
    })
    if (!dbUser) return null

    // Get all necessary data in parallel
    const [accounts, debts, goals, subscriptions, transactions] = await Promise.all([
        db.account.findMany({ where: { userId: user.id } }),
        db.debt.findMany({
            where: { userId: user.id },
            include: { account: true }
        }),
        db.goal.findMany({ where: { userId: user.id } }),
        db.subscription.findMany({
            where: { userId: user.id, status: 'ACTIVE' }
        }),
        db.transaction.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
                }
            }
        })
    ])

    // Calculate summary
    const assetTypes = ['BANK', 'CASH', 'WALLET', 'SAVINGS', 'INVESTMENT']
    const liabilityTypes = ['CREDIT_CARD', 'LOAN']

    const totalAssets = accounts
        .filter(a => assetTypes.includes(a.type))
        .reduce((sum, a) => sum + Number(a.balance), 0)

    const totalLiabilities = accounts
        .filter(a => liabilityTypes.includes(a.type))
        .reduce((sum, a) => sum + Math.abs(Number(a.balance)), 0)

    const netWorth = totalAssets - totalLiabilities

    // Monthly income/expenses from transactions
    const monthlyIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const monthlyExpenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const monthlyNetCashflow = monthlyIncome - monthlyExpenses
    const savingsRate = monthlyIncome > 0 ? (monthlyNetCashflow / monthlyIncome) * 100 : 0

    // Debts summary
    const totalDebt = debts.reduce((sum, d) => sum + Number(d.remainingAmount), 0)
    const totalMinimumPayments = debts.reduce((sum, d) => sum + (Number(d.minimumPayment) || 0), 0)
    const debtToIncomeRatio = monthlyIncome > 0 ? totalMinimumPayments / monthlyIncome : 0

    // Goals summary
    const totalGoalsTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0)
    const totalGoalsSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0)
    const goalsProgress = totalGoalsTarget > 0 ? (totalGoalsSaved / totalGoalsTarget) * 100 : 0

    // Subscriptions total
    const monthlySubscriptions = subscriptions
        .filter(s => s.frequency === 'MONTHLY')
        .reduce((sum, s) => sum + Number(s.amount), 0) +
        subscriptions
        .filter(s => s.frequency === 'YEARLY')
        .reduce((sum, s) => sum + Number(s.amount) / 12, 0) +
        subscriptions
        .filter(s => s.frequency === 'WEEKLY')
        .reduce((sum, s) => sum + Number(s.amount) * 4, 0)

    const summary: FinancialSummary = {
        netWorth,
        totalAssets,
        totalLiabilities,
        monthlyIncome,
        monthlyExpenses,
        monthlyNetCashflow,
        savingsRate,
        totalDebt,
        totalMinimumPayments,
        debtToIncomeRatio,
        totalGoalsTarget,
        totalGoalsSaved,
        goalsProgress,
        monthlySubscriptions
    }

    // Analyze each debt
    const analyzedDebts: DebtAnalysis[] = debts.map(debt => {
        const paidAmount = Number(debt.totalAmount) - Number(debt.remainingAmount)
        const paidPercentage = Number(debt.totalAmount) > 0
            ? (paidAmount / Number(debt.totalAmount)) * 100
            : 0

        const payoffCalc = calculateDebtPayoff(
            Number(debt.remainingAmount),
            debt.interestRate ? Number(debt.interestRate) : null,
            debt.minimumPayment ? Number(debt.minimumPayment) : null
        )

        const paymentsRemaining = payoffCalc.monthsToPayOff

        return {
            id: debt.id,
            name: debt.name,
            totalAmount: Number(debt.totalAmount),
            remainingAmount: Number(debt.remainingAmount),
            interestRate: debt.interestRate ? Number(debt.interestRate) : null,
            minimumPayment: debt.minimumPayment ? Number(debt.minimumPayment) : null,
            dueDate: debt.dueDate,
            accountName: debt.account?.name || null,
            paidAmount,
            paidPercentage,
            paymentsRemaining,
            monthsToPayOff: payoffCalc.monthsToPayOff,
            totalInterestCost: payoffCalc.totalInterestCost,
            suggestedPayment: payoffCalc.suggestedPayment
        }
    })

    // Analyze each goal
    const analyzedGoals: GoalAnalysis[] = goals.map(goal => {
        const progress = Number(goal.targetAmount) > 0
            ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
            : 0

        const progressCalc = calculateGoalProgress(
            Number(goal.targetAmount),
            Number(goal.currentAmount),
            goal.deadline
        )

        return {
            id: goal.id,
            name: goal.name,
            targetAmount: Number(goal.targetAmount),
            currentAmount: Number(goal.currentAmount),
            deadline: goal.deadline,
            color: goal.color,
            progress,
            ...progressCalc
        }
    })

    // Generate advice
    const advice = generateAdvice(summary, analyzedDebts, analyzedGoals)

    // Calculate projections
    const projectedNetWorth = calculateProjectedNetWorth(netWorth, monthlyNetCashflow)

    return {
        summary,
        debts: analyzedDebts,
        goals: analyzedGoals,
        advice,
        projectedNetWorth
    }
}

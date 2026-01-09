"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma"
import { redirect } from "next/navigation"

// Helper to get start of month
function getStartOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

export async function getUserDashboardData() {
    const user = await currentUser()

    if (!user) {
        return null
    }

    const email = user.emailAddresses[0]?.emailAddress
    const name = `${user.firstName} ${user.lastName}`

    // Sync User logic (Upsert) to ensure they exist in our DB
    const dbUser = await db.user.upsert({
        where: { id: user.id },
        create: {
            id: user.id,
            email: email,
            name: name,
        },
        update: {
            email: email,     // Keep email in sync
            name: name,       // Keep name in sync
        }
    })

    const startOfCurrentMonth = getStartOfMonth(new Date())

    // Fetch parallel data for dashboard
    const [accounts, transactions, monthlyStats, historicalStats] = await Promise.all([
        // 1. Get Accounts for Net Worth
        db.account.findMany({
            where: { userId: dbUser.id },
            select: { balance: true, type: true }
        }),

        // 2. Get Recent Transactions
        db.transaction.findMany({
            where: { userId: dbUser.id },
            orderBy: { date: 'desc' },
            take: 5,
            include: {
                category: {
                    select: { name: true, icon: true }
                }
            }
        }),

        // 3. Current Month Stats (Income vs Expense)
        db.transaction.groupBy({
            by: ['type'],
            where: {
                userId: dbUser.id,
                date: { gte: startOfCurrentMonth }
            },
            _sum: { amount: true }
        }),

        // 4. Historical Data for Chart (Last 6 Months)
        db.transaction.findMany({
            where: {
                userId: dbUser.id,
                date: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) // 6 months ago roughly
                }
            },
            select: {
                date: true,
                type: true,
                amount: true,
                account: {
                    select: { type: true }
                }
            }
        })
    ])

    // Calculate Net Worth
    // User Request: Exclude debts (Credit Cards, Loans) from Net Worth.
    // Include: BANK, CASH, SAVINGS, WALLET, INVESTMENT, OTHER.
    const assetTypes = ['BANK', 'CASH', 'WALLET', 'SAVINGS', 'INVESTMENT', 'OTHER']
    const netWorth = accounts.reduce((acc, curr) => {
        if (assetTypes.includes(curr.type)) {
            return acc + Number(curr.balance)
        }
        return acc
    }, 0)

    // Process Monthly Stats
    const incomeStat = monthlyStats.find(s => s.type === 'INCOME')?._sum.amount || 0
    const expenseStat = monthlyStats.find(s => s.type === 'EXPENSE')?._sum.amount || 0

    // Process Chart Data
    // We want to chart "Asset Growth" (Net Worth excluding debts).
    // So we only look at transactions that affected Asset Accounts.

    // Sort historical transactions DESC (newest first)
    const sortedTxs = historicalStats.sort((a, b) => b.date.getTime() - a.date.getTime())

    const chartData = []
    let currentCalcNW = netWorth
    const today = new Date()

    // 6 months logic
    for (let i = 0; i < 6; i++) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1) // Start of month i
        const monthName = targetDate.toLocaleString('default', { month: 'short' })

        // Find transactions in this 'month slot' by looking backwards.
        // We calculate the Net Change for the period [Target Month Start, NOW]
        // BUT only for transactions on Asset Accounts.

        const txsInPeriod = sortedTxs.filter(t =>
            t.date >= targetDate &&
            t.account &&
            assetTypes.includes(t.account.type)
        )

        let netChangeSinceThen = 0
        txsInPeriod.forEach(t => {
            if (t.type === 'INCOME') netChangeSinceThen += Number(t.amount)
            if (t.type === 'EXPENSE') netChangeSinceThen -= Number(t.amount)
            // Transfers between asset accounts cancel out (Expense + Income) so usually 0 net change.
            // But if transfer to/from Debt account?
            // Transfer Asset -> Debt (Paying off card).
            // This is an EXPENSE on the Asset Account (or Transfer out).
            // So Asset Balance decreases.
            // Net Change = -Amount.
            // Previous NW = Current (Lower) - (-Amount) = Higher.
            // Make sense. Paying debt reduces liquid assets.
        })

        const historicNW = currentCalcNW - netChangeSinceThen

        chartData.unshift({
            name: monthName,
            value: historicNW
        })
    }

    // Add "Now" as the last point if we want, or just use the 6 months.
    // The loop produced 6 points (Start of Month 0, Start of Month -1 ...)
    // Usually we want "End of Month" values.
    // But this is fine for a trend line.

    // Calculate Projected Net Worth (5 years)
    // Formula: Future Value with compound growth + monthly contributions
    const monthlyNetCashflow = Number(incomeStat) - Number(expenseStat)
    const annualReturnRate = 0.07 // 7% average market return
    const monthlyReturn = annualReturnRate / 12

    function calculateFutureValue(months: number): number {
        let value = netWorth
        for (let i = 0; i < months; i++) {
            value = value * (1 + monthlyReturn) + monthlyNetCashflow
        }
        return Math.round(value)
    }

    const projectedWealth5Years = calculateFutureValue(60) // 5 years = 60 months

    return {
        user: dbUser,
        netWorth,
        monthlyIncome: Number(incomeStat),
        monthlyExpenses: Number(expenseStat),
        accountsCount: accounts.length,
        recentTransactions: transactions,
        chartData,
        projectedWealth5Years
    }
}

"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function getUserDashboardData() {
    const user = await currentUser()

    if (!user) {
        redirect("/sign-in")
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

    // Fetch parallel data for dashboard
    const [accounts, transactions, monthlyStats] = await Promise.all([
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

        // 3. Simple aggregations for KPI (Approximation for demo speed)
        // Real implementation effectively needs grouping by month/type
        db.transaction.aggregate({
            where: {
                userId: dbUser.id,
                date: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // First day of current month
                }
            },
            _sum: {
                amount: true
            },
            _count: true
        })
    ])

    // Calculate Net Worth
    // User Request: Only include "Real Money" (Liquid Assets).
    // Include: BANK, CASH, SAVINGS.
    // Exclude: CREDIT_CARD, LOAN.
    const netWorth = accounts.reduce((acc, curr) => {
        if (['BANK', 'CASH', 'SAVINGS'].includes(curr.type)) {
            return acc + Number(curr.balance)
        }
        return acc
    }, 0)

    return {
        user: dbUser,
        netWorth,
        accountsCount: accounts.length,
        recentTransactions: transactions,
        monthlyStats
    }
}

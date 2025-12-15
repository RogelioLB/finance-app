"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { TransactionType } from "@prisma/client"



export async function getTransactionData() {
    const user = await currentUser()
    if (!user) return { transactions: [], accounts: [], categories: [] }

    const [transactions, accounts, categories] = await Promise.all([
        db.transaction.findMany({
            where: { userId: user.id },
            orderBy: { date: 'desc' },
            include: { category: true, account: true }
        }),
        db.account.findMany({ where: { userId: user.id } }),
        db.category.findMany({ where: { userId: user.id } })
    ])

    return {
        // Serialize Transactions
        transactions: transactions.map(t => ({
            ...t,
            amount: Number(t.amount),
            date: t.date, // Date objects are fine for Client Components (auto-serialized to string, but safer to keep if Page is Server) 
            // Actually, raw Date objects are fine if passed from Server Comp to Client Comp in Props? 
            // No, typically need to be serializable. Prisma Dates are Date objects.
            // But typically "Warning: Only plain objects...". Date is not plain, but Next specific behavior might vary.
            // Safest is convert to string or number. Let's rely on standard serialization for Dates usually works, 
            // BUT Decimal definitely fails.
            account: {
                ...t.account,
                balance: Number(t.account.balance),
                creditLimit: t.account.creditLimit ? Number(t.account.creditLimit) : null,
                interestRate: t.account.interestRate ? Number(t.account.interestRate) : null,
                minimumPayment: t.account.minimumPayment ? Number(t.account.minimumPayment) : null,
            },
            category: t.category ? { ...t.category } : null
        })),

        // Serialize Accounts
        accounts: accounts.map(a => ({
            ...a,
            balance: Number(a.balance),
            creditLimit: a.creditLimit ? Number(a.creditLimit) : null,
            interestRate: a.interestRate ? Number(a.interestRate) : null,
            minimumPayment: a.minimumPayment ? Number(a.minimumPayment) : null,
        })),

        // Categories are simple strings/ints usually, id etc. Map just in case if added fields
        categories: categories
    }
}

export async function createCategory(formData: FormData) {
    const user = await currentUser()
    if (!user) return

    const name = formData.get("name") as string
    const type = formData.get("type") as TransactionType || "EXPENSE"
    const icon = formData.get("icon") as string || "Circle"
    const color = formData.get("color") as string || "#000000"

    await db.category.create({
        data: {
            userId: user.id,
            name,
            type,
            icon,
            color
        }
    })
    revalidatePath("/dashboard/transactions")
}

export async function createTransaction(formData: FormData) {
    const user = await currentUser()
    if (!user) return

    const amount = parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const categoryId = formData.get("categoryId") as string
    const accountId = formData.get("accountId") as string
    const toAccountId = formData.get("toAccountId") as string
    const date = new Date(formData.get("date") as string)
    const type = formData.get("type") as TransactionType || "EXPENSE"

    // Fetch Account to check type and limits
    const account = await db.account.findUnique({ where: { id: accountId } })
    if (!account) throw new Error("Account not found")

    // Validation: Check Credit Limit
    if (account.type === 'CREDIT_CARD' && type === 'EXPENSE' && account.creditLimit) {
        const newBalance = Number(account.balance) + amount
        if (newBalance > Number(account.creditLimit)) {
            throw new Error(`Transaction exceeds credit limit. Available: $${Number(account.creditLimit) - Number(account.balance)}`)
        }
    }

    // Atomic Transaction
    await db.$transaction(async (tx) => {
        // 1. Create Transaction Record
        await tx.transaction.create({
            data: {
                userId: user.id,
                amount,
                description,
                accountId,
                toAccountId: type === 'TRANSFER' ? toAccountId : undefined,
                categoryId: type === 'TRANSFER' ? null : (categoryId || null),
                date,
                type,
            }
        })

        // 2. Update Account Balances
        if (type === 'INCOME') {
            // Income always increases balance (reduces debt for credit cards if negative representation, but we use positive debt)
            // Wait, if we use Positive Debt:
            // Credit Card: Income (Payment) -> Decrement Debt. Expense -> Increment Debt.
            // Bank: Income -> Increment Balance. Expense -> Decrement Balance.

            if (account.type === 'CREDIT_CARD' || account.type === 'LOAN') {
                await tx.account.update({
                    where: { id: accountId },
                    data: { balance: { decrement: amount } } // Paying off debt
                })
            } else {
                await tx.account.update({
                    where: { id: accountId },
                    data: { balance: { increment: amount } }
                })
            }

        } else if (type === 'EXPENSE') {
            if (account.type === 'CREDIT_CARD' || account.type === 'LOAN') {
                await tx.account.update({
                    where: { id: accountId },
                    data: { balance: { increment: amount } } // Increasing debt
                })
            } else {
                await tx.account.update({
                    where: { id: accountId },
                    data: { balance: { decrement: amount } }
                })
            }
        } else if (type === 'TRANSFER' && toAccountId) {
            // Transfer Logic needs to handle types too.
            // Source: AccountId. Target: ToAccountId.

            // Handle Source (Sending Money)
            if (account.type === 'CREDIT_CARD' || account.type === 'LOAN') {
                await tx.account.update({ where: { id: accountId }, data: { balance: { increment: amount } } }) // "Cash Advance" increases debt
            } else {
                await tx.account.update({ where: { id: accountId }, data: { balance: { decrement: amount } } })
            }

            // Handle Target (Receiving Money)
            const toAccount = await tx.account.findUnique({ where: { id: toAccountId } })
            if (toAccount) {
                if (toAccount.type === 'CREDIT_CARD' || toAccount.type === 'LOAN') {
                    await tx.account.update({ where: { id: toAccountId }, data: { balance: { decrement: amount } } }) // Paying off debt
                } else {
                    await tx.account.update({ where: { id: toAccountId }, data: { balance: { increment: amount } } })
                }
            }
        }
    })

    revalidatePath("/dashboard/transactions")
    revalidatePath("/dashboard")
}


export async function deleteTransaction(id: string) {
    const user = await currentUser()
    if (!user) return

    // Atomic Deletion and Reversal
    await db.$transaction(async (tx) => {
        // 1. Get Transaction to know what to reverse
        const transaction = await tx.transaction.findUnique({
            where: { id, userId: user.id },
            include: { account: true }
        })

        if (!transaction) throw new Error("Transaction not found")

        const amount = Number(transaction.amount)
        const type = transaction.type
        const accountId = transaction.accountId
        const toAccountId = transaction.toAccountId

        // 2. Reverse Balances
        if (type === 'INCOME') {
            await tx.account.update({
                where: { id: accountId },
                data: { balance: { decrement: amount } } // Remove income
            })
        } else if (type === 'EXPENSE') {
            // If credit card expense was deleted, we reduce the debt (decrement balance)
            // Wait, earlier logic: Expense on Credit Card -> Increment Balance (Debt).
            // So Deleting Expense -> Decrement Balance (Debt).
            // Expense on Bank -> Decrement Balance.
            // So Deleting Expense -> Increment Balance.

            const account = await tx.account.findUnique({ where: { id: accountId } })
            if (account && (account.type === 'CREDIT_CARD' || account.type === 'LOAN')) {
                await tx.account.update({
                    where: { id: accountId },
                    data: { balance: { decrement: amount } }
                })
            } else {
                await tx.account.update({
                    where: { id: accountId },
                    data: { balance: { increment: amount } }
                })
            }
        } else if (type === 'TRANSFER' && toAccountId) {
            // Reverse Source
            // Original: Source Decrement (or Increment if Debt).
            // Reversal: Source Increment (or Decrement if Debt).
            const sourceAccount = await tx.account.findUnique({ where: { id: accountId } })
            if (sourceAccount && (sourceAccount.type === 'CREDIT_CARD' || sourceAccount.type === 'LOAN')) {
                // Original was Increment (Debt increase). So Reversal is Decrement.
                await tx.account.update({ where: { id: accountId }, data: { balance: { decrement: amount } } })
            } else {
                // Original was Decrement (Asset decrease). Reversal is Increment.
                await tx.account.update({ where: { id: accountId }, data: { balance: { increment: amount } } })
            }

            // Reverse Target
            // Original: Target Increment (or Decrement if Debt).
            // Reversal: Target Decrement (or Increment if Debt).
            const targetAccount = await tx.account.findUnique({ where: { id: toAccountId } })
            if (targetAccount) {
                if (targetAccount.type === 'CREDIT_CARD' || targetAccount.type === 'LOAN') {
                    // Original was Decrement (Debt reduced). Reversal is Increment.
                    await tx.account.update({ where: { id: toAccountId }, data: { balance: { increment: amount } } })
                } else {
                    // Original was Increment (Asset increased). Reversal is Decrement.
                    await tx.account.update({ where: { id: toAccountId }, data: { balance: { decrement: amount } } })
                }
            }
        }

        // 3. Delete Transaction
        await tx.transaction.delete({
            where: { id }
        })
    })

    revalidatePath("/dashboard/transactions")
    revalidatePath("/dashboard")
}

export async function updateTransaction(id: string, formData: FormData) {
    const user = await currentUser()
    if (!user) return

    const amount = parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const categoryId = formData.get("categoryId") as string
    const accountId = formData.get("accountId") as string
    const toAccountId = formData.get("toAccountId") as string
    const date = new Date(formData.get("date") as string)
    const type = formData.get("type") as TransactionType || "EXPENSE"

    // Fetch Account to check type and limits for the NEW transaction
    const account = await db.account.findUnique({ where: { id: accountId } })
    if (!account) throw new Error("Account not found")

    await db.$transaction(async (tx) => {
        // 1. Fetch ORIGINAL Transaction
        const originalTransaction = await tx.transaction.findUnique({
            where: { id, userId: user.id },
            include: { account: true }
        })

        if (!originalTransaction) throw new Error("Transaction not found")

        // 2. REVERSE Original Effect
        const oldAmount = Number(originalTransaction.amount)
        const oldType = originalTransaction.type
        const oldAccountId = originalTransaction.accountId
        const oldToAccountId = originalTransaction.toAccountId

        if (oldType === 'INCOME') {
            await tx.account.update({ where: { id: oldAccountId }, data: { balance: { decrement: oldAmount } } })
        } else if (oldType === 'EXPENSE') {
            const oldAccount = await tx.account.findUnique({ where: { id: oldAccountId } })
            if (oldAccount && (oldAccount.type === 'CREDIT_CARD' || oldAccount.type === 'LOAN')) {
                await tx.account.update({ where: { id: oldAccountId }, data: { balance: { decrement: oldAmount } } })
            } else {
                await tx.account.update({ where: { id: oldAccountId }, data: { balance: { increment: oldAmount } } })
            }
        } else if (oldType === 'TRANSFER' && oldToAccountId) {
            const oldSource = await tx.account.findUnique({ where: { id: oldAccountId } })
            if (oldSource && (oldSource.type === 'CREDIT_CARD' || oldSource.type === 'LOAN')) {
                await tx.account.update({ where: { id: oldAccountId }, data: { balance: { decrement: oldAmount } } })
            } else {
                await tx.account.update({ where: { id: oldAccountId }, data: { balance: { increment: oldAmount } } })
            }
            const oldTarget = await tx.account.findUnique({ where: { id: oldToAccountId } })
            if (oldTarget) {
                if (oldTarget.type === 'CREDIT_CARD' || oldTarget.type === 'LOAN') {
                    await tx.account.update({ where: { id: oldToAccountId }, data: { balance: { increment: oldAmount } } })
                } else {
                    await tx.account.update({ where: { id: oldToAccountId }, data: { balance: { decrement: oldAmount } } })
                }
            }
        }

        // 3. APPLY New Effect
        // Validation: Check Credit Limit (if credit card expense)
        const accountToCheck = await tx.account.findUnique({ where: { id: accountId } })
        if (!accountToCheck) throw new Error("Account not found")

        if (accountToCheck.type === 'CREDIT_CARD' && type === 'EXPENSE' && accountToCheck.creditLimit) {
            const newBalanceVal = Number(accountToCheck.balance) + amount
            if (newBalanceVal > Number(accountToCheck.creditLimit)) {
                throw new Error(`Transaction exceeds credit limit.`)
            }
        }

        if (type === 'INCOME') {
            if (accountToCheck.type === 'CREDIT_CARD' || accountToCheck.type === 'LOAN') {
                await tx.account.update({ where: { id: accountId }, data: { balance: { decrement: amount } } })
            } else {
                await tx.account.update({ where: { id: accountId }, data: { balance: { increment: amount } } })
            }
        } else if (type === 'EXPENSE') {
            if (accountToCheck.type === 'CREDIT_CARD' || accountToCheck.type === 'LOAN') {
                await tx.account.update({ where: { id: accountId }, data: { balance: { increment: amount } } })
            } else {
                await tx.account.update({ where: { id: accountId }, data: { balance: { decrement: amount } } })
            }
        } else if (type === 'TRANSFER' && toAccountId) {
            if (accountToCheck.type === 'CREDIT_CARD' || accountToCheck.type === 'LOAN') {
                await tx.account.update({ where: { id: accountId }, data: { balance: { increment: amount } } })
            } else {
                await tx.account.update({ where: { id: accountId }, data: { balance: { decrement: amount } } })
            }
            const toAccount = await tx.account.findUnique({ where: { id: toAccountId } })
            if (toAccount) {
                if (toAccount.type === 'CREDIT_CARD' || toAccount.type === 'LOAN') {
                    await tx.account.update({ where: { id: toAccountId }, data: { balance: { decrement: amount } } })
                } else {
                    await tx.account.update({ where: { id: toAccountId }, data: { balance: { increment: amount } } })
                }
            }
        }

        // 4. Update Transaction Record
        await tx.transaction.update({
            where: { id },
            data: {
                amount,
                description,
                accountId,
                toAccountId: type === 'TRANSFER' ? toAccountId : undefined,
                categoryId: type === 'TRANSFER' ? null : (categoryId || null),
                date,
                type,
            }
        })
    })

    revalidatePath("/dashboard/transactions")
    revalidatePath("/dashboard")
}

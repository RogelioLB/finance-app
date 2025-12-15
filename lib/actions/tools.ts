"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { RecurringInterval } from "@prisma/client"

export async function getSubscriptions() {
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    const subscriptions = await db.subscription.findMany({
        where: { userId: user.id },
        include: { account: true },
        orderBy: { nextPaymentDate: 'asc' }
    })

    return subscriptions
}

export async function createSubscription(formData: FormData) {
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    const name = formData.get("name") as string
    const amount = parseFloat(formData.get("amount") as string)
    const frequency = formData.get("frequency") as RecurringInterval
    const nextPaymentDate = new Date(formData.get("nextPaymentDate") as string)
    // Optional: Link to an account for auto-deduction
    const accountId = formData.get("accountId") as string

    await db.subscription.create({
        data: {
            userId: user.id,
            name,
            amount,
            frequency,
            nextPaymentDate,
            accountId: accountId || null,
            status: "ACTIVE"
        }
    })

    revalidatePath("/dashboard/tools")
}

export async function deleteSubscription(id: string) {
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    await db.subscription.delete({
        where: { id, userId: user.id }
    })

    revalidatePath("/dashboard/tools")
}

export async function getGoals() {
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    const goals = await db.goal.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    })

    return goals
}

export async function createGoal(formData: FormData) {
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    const name = formData.get("name") as string
    const targetAmount = parseFloat(formData.get("targetAmount") as string)
    const currentAmount = parseFloat(formData.get("currentAmount") as string) || 0
    const deadline = formData.get("deadline") ? new Date(formData.get("deadline") as string) : null
    const color = formData.get("color") as string || "bg-emerald-500"

    await db.goal.create({
        data: {
            userId: user.id,
            name,
            targetAmount,
            currentAmount,
            deadline,
            color
        }
    })

    revalidatePath("/dashboard/tools")
}

export async function deleteGoal(id: string) {
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    await db.goal.delete({
        where: { id, userId: user.id }
    })

    revalidatePath("/dashboard/tools")
}

export async function getDebts() {
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    const debts = await db.debt.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { account: true }
    })

    return debts
}

export async function createDebt(formData: FormData) {
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    const name = formData.get("name") as string
    const totalAmount = parseFloat(formData.get("totalAmount") as string)
    const remainingAmount = parseFloat(formData.get("remainingAmount") as string) || totalAmount
    const interestRate = parseFloat(formData.get("interestRate") as string) || null
    const minimumPayment = parseFloat(formData.get("minimumPayment") as string) || null
    const dueDate = parseInt(formData.get("dueDate") as string) || null
    // Optional Linked Account
    const accountId = formData.get("accountId") as string

    await db.debt.create({
        data: {
            userId: user.id,
            name,
            totalAmount,
            remainingAmount,
            interestRate,
            minimumPayment,
            dueDate,
            accountId: accountId || null
        }
    })

    revalidatePath("/dashboard/tools")
}

export async function deleteDebt(id: string) {
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    await db.debt.delete({
        where: { id, userId: user.id }
    })

    revalidatePath("/dashboard/tools")
}

export async function updateDebt(id: string, formData: FormData) {
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    const name = formData.get("name") as string
    const totalAmount = parseFloat(formData.get("totalAmount") as string)
    const remainingAmount = parseFloat(formData.get("remainingAmount") as string)
    const interestRate = parseFloat(formData.get("interestRate") as string) || null
    const minimumPayment = parseFloat(formData.get("minimumPayment") as string) || null
    const dueDate = parseInt(formData.get("dueDate") as string) || null
    const accountId = formData.get("accountId") as string

    await db.debt.update({
        where: { id, userId: user.id },
        data: {
            name,
            totalAmount,
            remainingAmount,
            interestRate,
            minimumPayment,
            dueDate,
            accountId: accountId === 'none' ? null : accountId
        }
    })

    revalidatePath("/dashboard/tools")
}

export async function payDebt(debtId: string, amount: number, sourceAccountId: string) {
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    const debt = await db.debt.findUnique({
        where: { id: debtId, userId: user.id },
        include: { account: true }
    })

    if (!debt) throw new Error("Debt not found")

    // 1. Update Debt Remaining Amount
    const newRemainingMatches = Number(debt.remainingAmount) - amount
    await db.debt.update({
        where: { id: debtId },
        data: { remainingAmount: newRemainingMatches < 0 ? 0 : newRemainingMatches }
    })

    // 2. Create Transaction (Expense or Transfer)
    // If debt is linked to an account (e.g. Credit Card), this acts as a Transfer from Source Account -> Credit Card Account
    // This reduces Source Account balance and Reduces Credit Card "Balance" (if we treat CC balance as debt)
    // Actually, in our schema, 'createTransaction' handles balance updates.
    // If we create a TRANSFER from Source -> LinkedAccount.
    // Source Balance (Bank): Decreases.
    // Destination Balance (CC): Increases?
    // Wait, if CC balance is Debt (Positive $1000), paying it should DECREASE it.
    // In `createTransaction`: 
    // TRANSFER: decrement source, increment destination.
    // So if Destination is CC with $1000 balance (Debt), adding $500 makes it $1500 (More Debt)? 
    // OR is CC Balance negative (-$1000)?
    // User said: "cada transaccion que se haga que reste el balance de la tarjeta de credito es por que se genera una liberacion de credito"
    // So paying the card REDUCES the balance.
    // If I use my `createTransaction` logic:
    // If I create an EXPENSE on the Source Account, date: now, desc: Payment for [Debt Name].
    // And MANUALLY update the Linked Account if needed.

    // Let's create an EXPENSE on Source Account first.
    await db.transaction.create({
        data: {
            userId: user.id,
            accountId: sourceAccountId,
            type: "EXPENSE",
            amount: amount,
            date: new Date(),
            description: `Payment for ${debt.name}`,
            category: undefined // Could be "Debt Repayment" if category exists
        }
    })

    // Update Source Account Balance (Decrement)
    await db.account.update({
        where: { id: sourceAccountId },
        data: { balance: { decrement: amount } }
    })

    // 3. If Debt is linked to an account (Credit Card/Loan), we usually want to update ITS balance too.
    // But how? 
    // If user creates a manual "Expense" on a CC, balance goes UP (Debt increases).
    // If user creates an "Income" (Payment) on a CC, balance goes DOWN (Debt decreases).
    // So we should create an INCOME transaction on the Linked Account? Or just update balance?
    // Creating a transaction is better for history.
    if (debt.accountId) {
        await db.transaction.create({
            data: {
                userId: user.id,
                accountId: debt.accountId,
                type: "INCOME", // Treated as Payment/Income to the credit card
                amount: amount,
                date: new Date(),
                description: `Payment Received for ${debt.name}`,
            }
        })

        // Update Linked Account Balance (Decrement - Reducing Debt)
        // Check `createTransaction` logic again. INCOME -> Increment Balance?
        // Usually Income adds to balance.
        // If CC Balance is $1000 (Debt), and we add $500 Income.
        // We want it to be $500. So we should DECREMENT.
        // This suggests my Account Model for CC might be "Positive = Money I Have" (Negative = Debt).
        // Let's assume standard behavior:
        // Cash: $1000.
        // CC: -$500.
        // Pay $500 to CC.
        // Cash: $500.
        // CC: $0.
        // So Cash (Expense) -> Decrement ($1000 - $500 = $500). Correct.
        // CC (Income) -> Increment (-$500 + $500 = 0). Correct.

        // HOWEVER, if the user sees POSITIVE numbers for Debt in the UI (as I implemented in tools-client),
        // we might be storing them as Positive in DB?
        // prisma/schema: `balance Decimal @default(0.00) // Current balance (negative for debts)`
        // NOTE: Comment says NEGATIVE for debts.
        // In `ToolsClient` I did: `Number(debt.balance)`. If it's negative, I should display it as positive for "Debt Amount".
        // But the user said: "reste el balance... genera liberacion de credito".
        // If balance is -$1000. "Restar" (Subtract) $500 -> -$1500 (More debt?).
        // "Liberacion" implies getting closer to 0 or positive.
        // So we want to ADD to the negative balance.

        await db.account.update({
            where: { id: debt.accountId },
            data: { balance: { increment: amount } } // Paying off debt increases the (negative) balance towards 0
        })
    }

    revalidatePath("/dashboard/tools")
}

export async function updateGoal(id: string, formData: FormData) {
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    const name = formData.get("name") as string
    const targetAmount = parseFloat(formData.get("targetAmount") as string)
    // We generally don't update currentAmount via Edit, only via Contribute, but let's allow it in case of manual adjustment needs.
    const currentAmount = parseFloat(formData.get("currentAmount") as string)
    const deadline = formData.get("deadline") ? new Date(formData.get("deadline") as string) : null
    const color = formData.get("color") as string

    await db.goal.update({
        where: { id, userId: user.id },
        data: {
            name,
            targetAmount,
            currentAmount,
            deadline,
            color
        }
    })

    revalidatePath("/dashboard/tools")
}

export async function contributeToGoal(goalId: string, amount: number, sourceAccountId: string, destinationAccountId: string) {
    const user = await currentUser()
    if (!user) redirect("/sign-in")

    const goal = await db.goal.findUnique({
        where: { id: goalId, userId: user.id }
    })

    if (!goal) throw new Error("Goal not found")

    // 1. Update Goal Current Amount
    await db.goal.update({
        where: { id: goalId },
        data: { currentAmount: { increment: amount } }
    })

    // 2. Handle Money Movement
    // Case A: Transfer (Preferred) - Moving from Spending to Savings
    if (sourceAccountId !== 'none' && destinationAccountId !== 'none') {
        const description = `Contribution to Goal: ${goal.name}`

        // Create Transfer Transaction (Linked)
        // Ideally we create one record with type TRANSFER, but our schema might store it as two linked records or one record with toAccountId.
        // Schema Check: `toAccountId String?`. `type TransactionType`.
        // So we can create ONE transaction record with type=TRANSFER.

        await db.transaction.create({
            data: {
                userId: user.id,
                accountId: sourceAccountId,
                toAccountId: destinationAccountId,
                type: "TRANSFER",
                amount: amount,
                date: new Date(),
                description: description
            }
        })

        // Update Balances
        await db.account.update({
            where: { id: sourceAccountId },
            data: { balance: { decrement: amount } }
        })

        await db.account.update({
            where: { id: destinationAccountId },
            data: { balance: { increment: amount } }
        })
    }
    // Case B: Just Expense (Money leaves tracking)
    else if (sourceAccountId !== 'none') {
        await db.transaction.create({
            data: {
                userId: user.id,
                accountId: sourceAccountId,
                type: "EXPENSE",
                amount: amount,
                date: new Date(),
                description: `Contribution to Goal: ${goal.name}`
            }
        })

        await db.account.update({
            where: { id: sourceAccountId },
            data: { balance: { decrement: amount } }
        })
    }
    // Case C: Just Deposit (Money appears in Savings) - Unlikely for "Contribution" but possible if source is external
    else if (destinationAccountId !== 'none') {
        await db.transaction.create({
            data: {
                userId: user.id,
                accountId: destinationAccountId,
                type: "INCOME",
                amount: amount,
                date: new Date(),
                description: `Contribution to Goal: ${goal.name} (External Source)`
            }
        })

        await db.account.update({
            where: { id: destinationAccountId },
            data: { balance: { increment: amount } }
        })
    }

    revalidatePath("/dashboard/tools")
}

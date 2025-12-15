"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { AccountType } from "@prisma/client"

export async function getAccounts() {
    const user = await currentUser()
    if (!user) return []

    return await db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    })
}

// Update createAccount
export async function createAccount(formData: FormData) {
    const user = await currentUser()
    if (!user) return

    const name = formData.get("name") as string
    const balance = parseFloat(formData.get("balance") as string)
    const type = formData.get("type") as AccountType
    const creditLimit = formData.get("creditLimit") ? parseFloat(formData.get("creditLimit") as string) : null
    const color = formData.get("color") as string || "black"

    // New fields
    const cutoffDay = formData.get("cutoffDay") ? parseInt(formData.get("cutoffDay") as string) : null
    const paymentDay = formData.get("paymentDay") ? parseInt(formData.get("paymentDay") as string) : null

    await db.account.create({
        data: {
            userId: user.id,
            name,
            balance,
            type,
            creditLimit,
            cutoffDay,
            paymentDay,
            theme: color
        }
    })

    revalidatePath("/dashboard/accounts")
    revalidatePath("/dashboard")
}

// Update updateAccount
export async function updateAccount(formData: FormData) {
    const user = await currentUser()
    if (!user) return

    const accountId = formData.get("id") as string
    const name = formData.get("name") as string
    const balance = parseFloat(formData.get("balance") as string)
    const creditLimit = formData.get("creditLimit") ? parseFloat(formData.get("creditLimit") as string) : null
    const color = formData.get("color") as string || "black"

    // New fields
    const cutoffDay = formData.get("cutoffDay") ? parseInt(formData.get("cutoffDay") as string) : null
    const paymentDay = formData.get("paymentDay") ? parseInt(formData.get("paymentDay") as string) : null

    // Verify ownership
    const account = await db.account.findFirst({
        where: { id: accountId, userId: user.id }
    })

    if (!account) throw new Error("Account not found or unauthorized")

    await db.account.update({
        where: { id: accountId },
        data: {
            name,
            balance,
            creditLimit,
            cutoffDay,
            paymentDay,
            theme: color
        }
    })

    revalidatePath("/dashboard/accounts")
    revalidatePath("/dashboard")
}

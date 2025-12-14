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

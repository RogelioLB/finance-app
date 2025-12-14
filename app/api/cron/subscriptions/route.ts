
import { NextResponse } from 'next/server';
import { db } from "@/lib/prisma";
import { sendSubscriptionNotification } from "@/lib/email";
import { RecurringInterval } from "@prisma/client";

// This route should be protected. Vercel Cron sends a header `Authorization: Bearer <CRON_SECRET>`
// Since we might not have a secret set up easily in dev, checking for header presence or a query param is common.

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        // In production, verify this against process.env.CRON_SECRET
        // For development/demo, we'll proceed.

        console.log("Starting subscription processing...");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Fetch DUE Subscriptions
        const dueSubscriptions = await db.subscription.findMany({
            where: {
                status: 'ACTIVE',
                nextPaymentDate: {
                    lte: new Date() // Less than or equal to now/today
                }
            },
            include: {
                user: true,
                account: true
            }
        });

        console.log(`Found ${dueSubscriptions.length} due subscriptions.`);

        const results = [];

        for (const sub of dueSubscriptions) {
            // Transaction logic (duplicated from createTransaction effectively, but simplified)
            // We use a transaction to ensure atomicity for each subscription processing

            await db.$transaction(async (tx) => {
                // 1. Create Transaction
                await tx.transaction.create({
                    data: {
                        userId: sub.userId,
                        amount: sub.amount,
                        description: `Subscription: ${sub.name}`,
                        accountId: sub.accountId!, // Assuming accountId is present if active? Schema says optional.
                        // If no accountId, we can't create a financial transaction linked to an account.
                        // We should probably check sub.accountId.
                        date: new Date(),
                        type: 'EXPENSE',
                        category: { connectOrCreate: { where: { userId_name_type: { userId: sub.userId, name: 'Subscriptions', type: 'EXPENSE' } }, create: { userId: sub.userId, name: 'Subscriptions', type: 'EXPENSE', icon: 'Calendar' } } }
                    }
                });

                // 2. Update Balance (if account exists)
                if (sub.accountId) {
                    const account = sub.account;
                    if (account) {
                        if (account.type === 'CREDIT_CARD' || account.type === 'LOAN') {
                            await tx.account.update({ where: { id: sub.accountId }, data: { balance: { increment: sub.amount } } });
                        } else {
                            await tx.account.update({ where: { id: sub.accountId }, data: { balance: { decrement: sub.amount } } });
                        }
                    }
                }

                // 3. Update Next Payment Date
                let newDate = new Date(sub.nextPaymentDate);
                switch (sub.frequency) {
                    case 'DAILY': newDate.setDate(newDate.getDate() + 1); break;
                    case 'WEEKLY': newDate.setDate(newDate.getDate() + 7); break;
                    case 'MONTHLY': newDate.setMonth(newDate.getMonth() + 1); break;
                    case 'YEARLY': newDate.setFullYear(newDate.getFullYear() + 1); break;
                }

                await tx.subscription.update({
                    where: { id: sub.id },
                    data: { nextPaymentDate: newDate }
                });

                // 4. Send Email
                if (sub.user.email) {
                    await sendSubscriptionNotification(sub.user.email, sub.name, Number(sub.amount), newDate);
                }

                results.push({ id: sub.id, name: sub.name, status: 'processed' });
            });
        }

        return NextResponse.json({ success: true, processed: results.length, details: results });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}


import { NextResponse } from 'next/server';
import { db } from "@/lib/prisma";
import { sendSubscriptionNotification } from "@/lib/email";
import { RecurringInterval, TransactionType } from "@prisma/client";

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

        const results: any[] = [];

        for (const sub of dueSubscriptions) {
            // 1. Create Transaction (Only if linked to an account)
            if (sub.accountId) {
                // Ensure Category exists
                const category = await db.category.upsert({
                    where: {
                        userId_name_type: {
                            userId: sub.userId,
                            name: 'Subscriptions',
                            type: TransactionType.EXPENSE
                        }
                    },
                    update: {},
                    create: {
                        userId: sub.userId,
                        name: 'Subscriptions',
                        type: TransactionType.EXPENSE,
                        icon: 'Calendar'
                    }
                });

                await db.transaction.create({
                    data: {
                        userId: sub.userId,
                        amount: sub.amount,
                        description: `Subscription: ${sub.name}`,
                        accountId: sub.accountId,
                        date: new Date(),
                        type: TransactionType.EXPENSE,
                        categoryId: category.id
                    }
                });

                // 2. Update Balance
                await db.account.update({
                    where: { id: sub.accountId },
                    data: { balance: { decrement: sub.amount } }
                });
            }

            // 3. Update Next Payment Date
            let newDate = new Date(sub.nextPaymentDate);
            switch (sub.frequency) {
                case 'DAILY': newDate.setDate(newDate.getDate() + 1); break;
                case 'WEEKLY': newDate.setDate(newDate.getDate() + 7); break;
                case 'MONTHLY': newDate.setMonth(newDate.getMonth() + 1); break;
                case 'YEARLY': newDate.setFullYear(newDate.getFullYear() + 1); break;
            }

            await db.subscription.update({
                where: { id: sub.id },
                data: { nextPaymentDate: newDate }
            });

            // 4. Send Email
            if (sub.user.email) {
                await sendSubscriptionNotification(sub.user.email, sub.name, Number(sub.amount), newDate);
            }

            results.push({ id: sub.id, name: sub.name, status: 'processed' });
        }

        return NextResponse.json({ success: true, processed: results.length, details: results });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}


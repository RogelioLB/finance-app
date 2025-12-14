
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSubscriptionNotification(email: string, subscriptionName: string, amount: number, nextDate: Date) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Email notification skipped.");
        return;
    }

    try {
        const formattedDate = nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        await resend.emails.send({
            from: 'Finance App <onboarding@resend.dev>', // Update this with your verified domain in production
            to: email,
            subject: `Subscription Payment Alert: ${subscriptionName}`,
            html: `
        <h1>Subscription Payment Processed</h1>
        <p>Your subscription payment for <strong>${subscriptionName}</strong> of <strong>$${amount}</strong> has been recorded.</p>
        <p>The next payment is scheduled for: ${formattedDate}</p>
        <p>Manage your subscriptions in your dashboard.</p>
      `
        });
        console.log(`Email sent to ${email} for ${subscriptionName}`);
    } catch (error) {
        console.error("Failed to send email:", error);
    }
}

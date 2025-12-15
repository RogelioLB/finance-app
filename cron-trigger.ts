// index.tsx (Bun v1.3 runtime)
import { z } from "zod";

// Define the expected response schema from your API
const responseSchema = z.object({
    success: z.boolean(),
    processed: z.number().optional(),
    error: z.string().optional(),
});

// Calculate the URL
// In Railway, you might set APP_URL env var, or hardcode your production URL
const transformUrl = (url: string) => {
    if (!url) return "http://localhost:3000";
    if (url.startsWith("http")) return url;
    return `https://${url}`;
}

const APP_URL = transformUrl(process.env.APP_URL || "finance-app-production.up.railway.app"); // Replace with your actual domain if needed
const CRON_URL = `${APP_URL}/api/cron/subscriptions`;

console.log(`Triggering Cron Job at: ${CRON_URL}`);

try {
    const res = await fetch(CRON_URL);
    const data = responseSchema.parse(await res.json());

    const message = data.success
        ? `Success! Processed ${data.processed || 0} subscriptions.`
        : `Failed: ${data.error}`;

    const dialogSize = Math.max(message.length + 2, 32);

    console.log(`
${"-".repeat(dialogSize)}
< ${message} >
${"-".repeat(dialogSize)}
          \\    ___┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╮
            ,-╼______________________________________________|
          ,/_________________________________________________|
         (_         ,┄┄┄┄┄.                      ,┄┄┄┄┄┄┄┄.  |
___________-._____.'(_)(_)\_______________________.(_)=(_)\__/
`);

} catch (error) {
    console.error("Error triggering cron:", error);
    process.exit(1);
}


import { getSubscriptions } from "@/lib/actions/tools"
import { getTransactionData } from "@/lib/actions/transactions"
import { ToolsClient } from "./tools-client"

export default async function ToolsPage() {
    const subscriptions = await getSubscriptions()
    const { accounts } = await getTransactionData()

    return <ToolsClient subscriptions={subscriptions} accounts={accounts} />
}

import { getSubscriptions, getGoals, getDebts } from "@/lib/actions/tools"
import { getTransactionData } from "@/lib/actions/transactions"
import { ToolsClient } from "./tools-client"

export default async function ToolsPage() {
    const subscriptions = await getSubscriptions()
    const goals = await getGoals()
    const debts = await getDebts()
    const { accounts } = await getTransactionData()

    return <ToolsClient subscriptions={subscriptions} accounts={accounts} goals={goals} debts={debts} />
}

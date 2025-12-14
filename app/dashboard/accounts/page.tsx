import { getAccounts } from "@/lib/actions/accounts"
import { AccountsClient } from "./accounts-client"

export default async function AccountsPage() {
    const accounts = await getAccounts()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Accounts & Wallets</h1>
            </div>
            <AccountsClient initialAccounts={accounts} />
        </div>
    )
}

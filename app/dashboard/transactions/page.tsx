import { getTransactionData } from "@/lib/actions/transactions"
import { AddTransactionSheet } from "@/components/finance/AddTransactionSheet"
import { TransactionsTableClient } from "./transactions-table-client"
import { Transaction } from "./columns"

export default async function TransactionsPage() {
    const { transactions, accounts, categories } = await getTransactionData()

    // Map DB transactions to UI Column format
    const formattedTransactions: Transaction[] = transactions.map((t: any) => ({
        id: t.id,
        amount: Number(t.amount),
        status: "success" as const,
        payee: t.description || "Unknown",
        category: t.category?.name || "Uncategorized",
        categoryId: t.categoryId, // Pass raw ID
        account: t.account?.name || "Unknown",
        accountId: t.accountId, // Pass raw ID
        toAccountId: t.toAccountId,
        date: t.date.toISOString().split('T')[0],
        type: t.type === 'INCOME' ? 'income' : t.type === 'TRANSFER' ? 'transfer' : 'expense'
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground">Manage and categorize your financial activity.</p>
                </div>

                <AddTransactionSheet accounts={accounts} categories={categories} />
            </div>

            <TransactionsTableClient
                transactions={formattedTransactions}
                accounts={accounts}
                categories={categories}
            />
        </div>
    )
}

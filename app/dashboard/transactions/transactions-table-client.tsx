"use client"

import { DataTable } from "./data-table"
import { getColumns, Transaction } from "./columns"

interface TransactionsTableClientProps {
    transactions: Transaction[]
    accounts: any[]
    categories: any[]
}

export function TransactionsTableClient({ transactions, accounts, categories }: TransactionsTableClientProps) {
    const columns = getColumns(accounts, categories)

    return (
        <div className="bg-card rounded-xl border shadow-sm p-2">
            <DataTable columns={columns} data={transactions} />
        </div>
    )
}

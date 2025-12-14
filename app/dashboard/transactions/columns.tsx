"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateTransaction, deleteTransaction } from "@/lib/actions/transactions"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"
import { TransactionForm } from "@/components/finance/TransactionForm" // Import the form

// Need to update Transaction type to include raw IDs for editing
export type Transaction = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    payee: string // Description
    category: string // Name
    categoryId?: string // ID
    account: string // Name
    accountId: string // ID
    toAccountId?: string
    date: string
    type: "income" | "expense" | "transfer"
}

// Separate component for Actions to handle state (Dialog open/close)
// Now accepts accounts and categories to pass to the form
const ActionsCell = ({ transaction, accounts, categories }: { transaction: Transaction, accounts: any[], categories: any[] }) => {
    const [open, setOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteTransaction(transaction.id)
            setOpen(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleUpdate = async (formData: FormData) => {
        try {
            await updateTransaction(transaction.id, formData)
            setOpen(false)
        } catch (error) {
            console.error(error)
        }
    }

    // Prepare initial data for the form
    const initialData = {
        amount: transaction.amount,
        type: transaction.type.toUpperCase() as "INCOME" | "EXPENSE" | "TRANSFER",
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        toAccountId: transaction.toAccountId,
        date: new Date(transaction.date),
        description: transaction.payee
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(transaction.id)}>
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <SheetTrigger asChild>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                    </SheetTrigger>
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="mb-4">
                    <SheetTitle>Edit Transaction</SheetTitle>
                    <SheetDescription>
                        Modify transaction details.
                    </SheetDescription>
                </SheetHeader>
                <TransactionForm
                    accounts={accounts}
                    categories={categories}
                    onSubmit={handleUpdate}
                    initialData={initialData}
                />
            </SheetContent>
        </Sheet>
    )
}

export const getColumns = (accounts: any[], categories: any[]): ColumnDef<Transaction>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "payee",
        header: "Payee",
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "account",
        header: "Account",
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const type = row.original.type
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)

            return <div className={`text-right font-medium ${type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>{type === 'expense' ? '-' : '+'}{formatted}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionsCell transaction={row.original} accounts={accounts} categories={categories} />
    },
]

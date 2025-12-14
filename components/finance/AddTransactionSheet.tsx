"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { TransactionForm } from "@/components/finance/TransactionForm"
import { createTransaction } from "@/lib/actions/transactions"
import { useState } from "react"

interface AddTransactionSheetProps {
    accounts: any[]
    categories: any[]
}

export function AddTransactionSheet({ accounts, categories }: AddTransactionSheetProps) {
    const [open, setOpen] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        await createTransaction(formData)
        setOpen(false)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">Add Transaction</Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="mb-4">
                    <SheetTitle>Add Transaction</SheetTitle>
                    <SheetDescription>
                        Enter details for a new transaction or transfer.
                    </SheetDescription>
                </SheetHeader>
                <TransactionForm
                    accounts={accounts}
                    categories={categories}
                    onSubmit={handleSubmit}
                />
            </SheetContent>
        </Sheet>
    )
}

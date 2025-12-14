"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AccountCard } from "@/components/finance/AccountCard"
import { AccountForm } from "@/components/finance/AccountForm"
import { Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { createAccount, updateAccount } from "@/lib/actions/accounts"

export function AccountsClient({ initialAccounts }: { initialAccounts: any[] }) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<any>(null)

    const handleEditClick = (account: any) => {
        setSelectedAccount(account)
        setIsEditOpen(true)
    }

    const handleUpdateAccount = async (formData: FormData) => {
        formData.set("id", selectedAccount.id)
        await updateAccount(formData)
        setIsEditOpen(false)
    }

    const handleCreateAccount = async (formData: FormData) => {
        await createAccount(formData)
        setIsAddOpen(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Account Cards */}
                {initialAccounts.map((account) => (
                    <div
                        key={account.id}
                        onClick={() => handleEditClick(account)}
                        className="group relative cursor-pointer h-full"
                    >
                        <AccountCard
                            name={account.name}
                            balance={Number(account.balance)}
                            type={account.type.toLowerCase() as any}
                            colorVariant={account.theme || "black"}
                            creditLimit={Number(account.creditLimit) || undefined}
                            cutoffDay={account.cutoffDay}
                            paymentDay={account.paymentDay}
                            className="h-full"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl backdrop-blur-[1px] pointer-events-none z-20">
                            <span className="text-white font-medium bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md">
                                Edit Account
                            </span>
                        </div>
                    </div>
                ))}

                {/* Add New Account Button / Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <button className="h-[220px] w-full rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-indigo-500/50 hover:bg-indigo-50/5 dark:hover:bg-indigo-900/10 flex flex-col items-center justify-center gap-4 transition-all group">
                            <div className="h-12 w-12 rounded-full bg-muted group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 flex items-center justify-center transition-colors">
                                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-indigo-600" />
                            </div>
                            <p className="font-medium text-muted-foreground group-hover:text-indigo-600">Add New Account</p>
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Add New Account</DialogTitle>
                        </DialogHeader>
                        <AccountForm
                            onSubmit={handleCreateAccount}
                            onCancel={() => setIsAddOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit Account Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Account</DialogTitle>
                        <DialogDescription>
                            Update the details for this account.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAccount && (
                        <AccountForm
                            defaultValues={selectedAccount}
                            onSubmit={handleUpdateAccount}
                            onCancel={() => setIsEditOpen(false)}
                            isEdit={true}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}

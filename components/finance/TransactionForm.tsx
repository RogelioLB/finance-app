"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
    Delete,
    ArrowRightLeft,
    TrendingUp,
    TrendingDown,
    CalendarIcon,
    Plus,
    CreditCard,
    Wallet,
    Landmark
} from "lucide-react"
import { format } from "date-fns"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createCategory } from "@/lib/actions/transactions"

interface TransactionFormProps {
    accounts: any[]
    categories: any[]
    onSubmit: (formData: FormData) => Promise<void>
    onCancel?: () => void
    initialData?: {
        amount: number
        type: "INCOME" | "EXPENSE" | "TRANSFER"
        accountId: string
        toAccountId?: string | null
        categoryId?: string | null
        date: Date
        description?: string | null
    }
}

export function TransactionForm({ accounts, categories, onSubmit, onCancel, initialData }: TransactionFormProps) {
    const [amount, setAmount] = useState(initialData ? initialData.amount.toString() : "0")
    const [selectedType, setSelectedType] = useState<"INCOME" | "EXPENSE" | "TRANSFER">(initialData?.type || "EXPENSE")
    const [selectedAccount, setSelectedAccount] = useState<string>(initialData?.accountId || "")
    const [targetAccount, setTargetAccount] = useState<string>(initialData?.toAccountId || "") // For transfers
    const [selectedCategory, setSelectedCategory] = useState<string>(initialData?.categoryId || "")
    const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date())
    const [description, setDescription] = useState(initialData?.description || "")

    // Category Creation State
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")

    const handleNumberClick = (num: string) => {
        if (amount === "0" && num !== ".") {
            setAmount(num)
        } else {
            if (num === "." && amount.includes(".")) return
            setAmount(prev => prev + num)
        }
    }

    const handleBackspace = () => {
        if (amount.length === 1) {
            setAmount("0")
        } else {
            setAmount(prev => prev.slice(0, -1))
        }
    }

    const handleSubmit = async () => {
        const formData = new FormData()
        formData.append("amount", amount)
        formData.append("type", selectedType)
        formData.append("accountId", selectedAccount)
        if (selectedType === 'TRANSFER') {
            formData.append("toAccountId", targetAccount)
        } else {
            formData.append("categoryId", selectedCategory)
        }
        formData.append("date", date.toISOString())
        formData.append("description", description)

        await onSubmit(formData)
    }

    const handleCreateCategory = async () => {
        const formData = new FormData()
        formData.append("name", newCategoryName)
        formData.append("type", selectedType === 'INCOME' ? 'INCOME' : 'EXPENSE')
        await createCategory(formData)
        setIsCategoryDialogOpen(false)
        setNewCategoryName("")
        // Optimistic update or refetch would be ideal here, but reliance on parent re-render is standard
    }

    // Filter categories by type
    const filteredCategories = useMemo(() => {
        if (selectedType === 'TRANSFER') return []
        return categories.filter(c => c.type === selectedType)
    }, [categories, selectedType])

    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'BANK': return <Landmark className="w-4 h-4" />
            case 'CASH': return <Wallet className="w-4 h-4" />
            case 'CREDIT_CARD': return <CreditCard className="w-4 h-4" />
            default: return <Wallet className="w-4 h-4" />
        }
    }

    return (
        <div className="flex flex-col h-full gap-4 p-6">
            {/* Display Screen */}
            {/* Display Screen */}
            <div className="bg-muted/30 p-6 rounded-2xl flex flex-col items-end justify-center min-h-[160px] relative overflow-hidden">
                <div className="absolute top-4 left-4 flex gap-2">
                    <Button
                        size="sm"
                        variant={selectedType === "EXPENSE" ? "destructive" : "outline"}
                        className={cn("rounded-full h-8 text-xs", selectedType === "EXPENSE" && "bg-red-500 hover:bg-red-600")}
                        onClick={() => setSelectedType("EXPENSE")}
                    >
                        <TrendingDown className="w-3 h-3 mr-1" /> Expense
                    </Button>
                    <Button
                        size="sm"
                        variant={selectedType === "INCOME" ? "default" : "outline"}
                        className={cn("rounded-full h-8 text-xs", selectedType === "INCOME" && "bg-emerald-500 hover:bg-emerald-600 text-white")}
                        onClick={() => setSelectedType("INCOME")}
                    >
                        <TrendingUp className="w-3 h-3 mr-1" /> Income
                    </Button>
                    <Button
                        size="sm"
                        variant={selectedType === "TRANSFER" ? "secondary" : "outline"}
                        className={cn("rounded-full h-8 text-xs", selectedType === "TRANSFER" && "bg-blue-500 hover:bg-blue-600 text-white")}
                        onClick={() => setSelectedType("TRANSFER")}
                    >
                        <ArrowRightLeft className="w-3 h-3 mr-1" /> Transfer
                    </Button>
                </div>
                <div className={cn(
                    "text-5xl font-bold tracking-tighter transition-colors mt-12",
                    selectedType === "EXPENSE" ? "text-red-500" : selectedType === "INCOME" ? "text-emerald-500" : "text-blue-500"
                )}>
                    {selectedType === "EXPENSE" ? "-" : ""}${amount}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {/* Left: Inputs & Selection */}
                <div className="space-y-4 flex flex-col">
                    {/* Account Selection */}
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                            {selectedType === 'TRANSFER' ? 'From Account' : 'Account'}
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            {accounts.map(acc => (
                                <div
                                    key={acc.id}
                                    onClick={() => setSelectedAccount(acc.id)}
                                    className={cn(
                                        "p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex flex-col gap-1 relative overflow-hidden",
                                        selectedAccount === acc.id
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-border hover:bg-muted/50"
                                    )}
                                >
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        {getAccountIcon(acc.type)}
                                        <span className="truncate">{acc.name}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        ${Number(acc.balance).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedType === 'TRANSFER' && (
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">To Account</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {accounts.filter(a => a.id !== selectedAccount).map(acc => (
                                    <div
                                        key={acc.id}
                                        onClick={() => setTargetAccount(acc.id)}
                                        className={cn(
                                            "p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex flex-col gap-1",
                                            targetAccount === acc.id
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500"
                                                : "border-border hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            {getAccountIcon(acc.type)}
                                            <span className="truncate">{acc.name}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            ${Number(acc.balance).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedType !== 'TRANSFER' && (
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Category</Label>
                            <div className="flex flex-wrap gap-2">
                                {filteredCategories.map(cat => (
                                    <div
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-colors",
                                            selectedCategory === cat.id
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background hover:bg-muted border-border"
                                        )}
                                    >
                                        {cat.icon && <span className="mr-1">{cat.icon}</span>}
                                        {cat.name}
                                    </div>
                                ))}
                                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                                    <DialogTrigger asChild>
                                        <button className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-muted-foreground/50 hover:bg-muted hover:border-primary transition-colors flex items-center">
                                            <Plus className="w-3 h-3 mr-1" /> New
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create New Category</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <Input
                                                placeholder="Category Name"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                            />
                                            <Button onClick={handleCreateCategory}>Create Category</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Details</Label>
                        <div className="flex flex-col gap-4">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => d && setDate(d)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Input
                                placeholder="Description (Optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Calculator Keypad */}
                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2 flex-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num) => (
                            <Button
                                key={num}
                                variant="outline"
                                className="h-full text-2xl font-light rounded-xl hover:bg-muted/50"
                                onClick={() => handleNumberClick(num.toString())}
                            >
                                {num}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            className="h-full text-xl rounded-xl hover:bg-red-50 hover:text-red-500"
                            onClick={handleBackspace}
                        >
                            <Delete className="w-6 h-6" />
                        </Button>
                    </div>
                    <Button
                        size="lg"
                        className="w-full h-16 text-lg rounded-xl mt-2"
                        onClick={handleSubmit}
                        disabled={!selectedAccount || parseFloat(amount) <= 0 || (selectedType === 'TRANSFER' && !targetAccount)}
                    >
                        Add Transaction
                    </Button>
                </div>
            </div>
        </div>
    )
}

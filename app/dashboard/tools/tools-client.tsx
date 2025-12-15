"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Target, TrendingDown, CalendarDays, Plus, Trash2, CreditCard, Pencil, DollarSign } from "lucide-react"
import { useState } from "react"
import { createSubscription, deleteSubscription, createGoal, deleteGoal, updateGoal, createDebt, deleteDebt, updateDebt, payDebt, contributeToGoal } from "@/lib/actions/tools"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface ToolsClientProps {
    subscriptions: any[]
    accounts: any[]
    goals: any[]
    debts: any[]
}

export function ToolsClient({ subscriptions, accounts, goals, debts }: ToolsClientProps) {
    const [isAddSubOpen, setIsAddSubOpen] = useState(false)
    const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)
    const [isAddDebtOpen, setIsAddDebtOpen] = useState(false)

    // Edit/Pay States
    const [editingDebt, setEditingDebt] = useState<any>(null)
    const [isEditDebtOpen, setIsEditDebtOpen] = useState(false)

    const [payingDebt, setPayingDebt] = useState<any>(null)
    const [isPayDebtOpen, setIsPayDebtOpen] = useState(false)

    const [editingGoal, setEditingGoal] = useState<any>(null)
    const [isEditGoalOpen, setIsEditGoalOpen] = useState(false)

    const [contributeGoal, setContributeGoal] = useState<any>(null)
    const [isContributeOpen, setIsContributeOpen] = useState(false)

    // Filter accounts
    const creditCards = accounts.filter(acc => acc.type === 'CREDIT_CARD')
    const fundingAccounts = accounts.filter(acc => acc.type === 'BANK' || acc.type === 'CASH' || acc.type === 'WALLET' || acc.type === 'SAVINGS')

    const handleCreateSubscription = async (formData: FormData) => {
        await createSubscription(formData)
        setIsAddSubOpen(false)
    }

    const handleCreateGoal = async (formData: FormData) => {
        await createGoal(formData)
        setIsAddGoalOpen(false)
    }

    const handleUpdateGoal = async (formData: FormData) => {
        if (!editingGoal) return
        await updateGoal(editingGoal.id, formData)
        setIsEditGoalOpen(false)
        setEditingGoal(null)
    }

    const handleCreateDebt = async (formData: FormData) => {
        await createDebt(formData)
        setIsAddDebtOpen(false)
    }

    const handleUpdateDebt = async (formData: FormData) => {
        if (!editingDebt) return
        await updateDebt(editingDebt.id, formData)
        setIsEditDebtOpen(false)
        setEditingDebt(null)
    }

    const handlePayDebt = async (formData: FormData) => {
        if (!payingDebt) return
        const amount = parseFloat(formData.get("amount") as string)
        const sourceAccountId = formData.get("sourceAccountId") as string

        await payDebt(payingDebt.id, amount, sourceAccountId)
        setIsPayDebtOpen(false)
        setPayingDebt(null)
    }

    const handleContributeGoal = async (formData: FormData) => {
        if (!contributeGoal) return
        const amount = parseFloat(formData.get("amount") as string)
        const sourceAccountId = formData.get("sourceAccountId") as string
        const destinationAccountId = formData.get("destinationAccountId") as string

        await contributeToGoal(contributeGoal.id, amount, sourceAccountId, destinationAccountId)
        setIsContributeOpen(false)
        setContributeGoal(null)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Financial Tools</h1>
                <p className="text-muted-foreground">Specialized tools to help you optimize your finances.</p>
            </div>

            <Tabs defaultValue="subscriptions" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                    <TabsTrigger value="debts">Debts</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                </TabsList>

                {/* Subscriptions Content */}
                <TabsContent value="subscriptions" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recurring Payments</CardTitle>
                                <CardDescription>Manage and track your monthly subscriptions.</CardDescription>
                            </div>
                            <Dialog open={isAddSubOpen} onOpenChange={setIsAddSubOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Subscription</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Subscription</DialogTitle>
                                    </DialogHeader>
                                    <form action={handleCreateSubscription} className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input name="name" placeholder="Netflix, Spotify..." required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Amount</Label>
                                            <Input name="amount" type="number" step="0.01" placeholder="0.00" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Frequency</Label>
                                            <Select name="frequency" defaultValue="MONTHLY">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                    <SelectItem value="YEARLY">Yearly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Next Payment Date</Label>
                                            <Input name="nextPaymentDate" type="date" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Account (for auto-deduction)</Label>
                                            <Select name="accountId">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Account" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button type="submit" className="w-full">Create Subscription</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {subscriptions.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No subscriptions found.</p>
                            ) : (
                                subscriptions.map((sub, i) => {
                                    const daysUntil = Math.ceil((new Date(sub.nextPaymentDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                    return (
                                        <div key={sub.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                                    <CalendarDays size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{sub.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Due {new Date(sub.nextPaymentDate).toLocaleDateString()} • {sub.frequency}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-bold">${Number(sub.amount).toFixed(2)}</p>
                                                    <Badge variant={daysUntil < 5 ? (daysUntil < 0 ? "outline" : "destructive") : "secondary"}>
                                                        {daysUntil < 0 ? "Overdue" : `In ${daysUntil} days`}
                                                    </Badge>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-destructive"
                                                    onClick={() => deleteSubscription(sub.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Debts Content */}
                <TabsContent value="debts" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Debt Tracking</CardTitle>
                                <CardDescription>Manage your debts and loan installments.</CardDescription>
                            </div>
                            <Dialog open={isAddDebtOpen} onOpenChange={setIsAddDebtOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Debt</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Debt</DialogTitle>
                                    </DialogHeader>
                                    <form action={handleCreateDebt} className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input name="name" placeholder="TV Installments, Person Loan..." required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Total Amount</Label>
                                                <Input name="totalAmount" type="number" step="0.01" required placeholder="1000.00" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Remaining</Label>
                                                <Input name="remainingAmount" type="number" step="0.01" placeholder="1000.00" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Interest Rate (%)</Label>
                                                <Input name="interestRate" type="number" step="0.01" placeholder="Optional" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Payment Day</Label>
                                                <Input name="dueDate" type="number" min="1" max="31" placeholder="e.g. 15" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Link to Account (Optional)</Label>
                                            <Select name="accountId">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Credit Card" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {creditCards.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">Link this debt to a credit card if it's an installment plan on that card.</p>
                                        </div>
                                        <Button type="submit" className="w-full">Track Debt</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {debts.length === 0 ? (
                                <div className="col-span-full text-center text-muted-foreground py-8">
                                    <p>No active debts tracked. Great job!</p>
                                </div>
                            ) : (
                                debts.map(debt => {
                                    const progress = debt.totalAmount > 0 ? ((Number(debt.totalAmount) - Number(debt.remainingAmount)) / Number(debt.totalAmount)) * 100 : 0

                                    return (
                                        <Card key={debt.id} className="relative border-l-4 border-l-red-500">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-lg font-bold">{debt.name}</CardTitle>
                                                        {debt.account && (
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                                <CreditCard size={12} />
                                                                <span>{debt.account.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1 -mt-1 -mr-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                            onClick={() => {
                                                                setEditingDebt(debt)
                                                                setIsEditDebtOpen(true)
                                                            }}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteDebt(debt.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4 pt-2">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-muted-foreground">Remaining</span>
                                                        <span className="font-bold text-red-600 dark:text-red-400">${Number(debt.remainingAmount).toLocaleString()}</span>
                                                    </div>
                                                    <Progress value={progress} className="h-2" />
                                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                        <span>{Math.round(progress)}% Paid</span>
                                                        <span>Total: ${Number(debt.totalAmount).toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                {(debt.interestRate || debt.dueDate) && (
                                                    <div className="flex gap-4 text-xs bg-muted/50 p-2 rounded">
                                                        {debt.interestRate && (
                                                            <div>
                                                                <span className="block text-muted-foreground">Interest</span>
                                                                <span className="font-medium">{debt.interestRate}%</span>
                                                            </div>
                                                        )}
                                                        {debt.dueDate && (
                                                            <div>
                                                                <span className="block text-muted-foreground">Due Day</span>
                                                                <span className="font-medium">{debt.dueDate}th</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <Button
                                                    className="w-full mt-2"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setPayingDebt(debt)
                                                        setIsPayDebtOpen(true)
                                                    }}
                                                >
                                                    <DollarSign className="w-4 h-4 mr-2" /> Make Payment
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )
                                })
                            )}
                        </CardContent>
                    </Card>

                    {/* Edit Debt Dialog */}
                    <Dialog open={isEditDebtOpen} onOpenChange={setIsEditDebtOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Debt Details</DialogTitle>
                            </DialogHeader>
                            {editingDebt && (
                                <form action={handleUpdateDebt} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input name="name" defaultValue={editingDebt.name} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Total Amount</Label>
                                            <Input name="totalAmount" type="number" step="0.01" defaultValue={Number(editingDebt.totalAmount)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Remaining</Label>
                                            <Input name="remainingAmount" type="number" step="0.01" defaultValue={Number(editingDebt.remainingAmount)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Interest Rate (%)</Label>
                                            <Input name="interestRate" type="number" step="0.01" defaultValue={editingDebt.interestRate ? Number(editingDebt.interestRate) : ''} placeholder="Optional" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Payment Day</Label>
                                            <Input name="dueDate" type="number" min="1" max="31" defaultValue={editingDebt.dueDate ? Number(editingDebt.dueDate) : ''} placeholder="e.g. 15" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Link to Account (Optional)</Label>
                                        <Select name="accountId" defaultValue={editingDebt.accountId || 'none'}>
                                            <SelectTrigger><SelectValue placeholder="Select Credit Card" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {creditCards.map(acc => (
                                                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="submit" className="w-full">Update Debt</Button>
                                </form>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Pay Debt Dialog */}
                    <Dialog open={isPayDebtOpen} onOpenChange={setIsPayDebtOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Record Debt Payment</DialogTitle>
                                <CardDescription>This will record an expense and update your debt balance.</CardDescription>
                            </DialogHeader>
                            {payingDebt && (
                                <form action={handlePayDebt} className="space-y-4 py-4">
                                    <div className="p-4 bg-muted/50 rounded-lg mb-4">
                                        <p className="text-sm font-medium">Paying off: <span className="font-bold">{payingDebt.name}</span></p>
                                        <p className="text-sm text-muted-foreground">Current Remaining: ${Number(payingDebt.remainingAmount).toLocaleString()}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Payment Amount</Label>
                                        <Input name="amount" type="number" step="0.01" placeholder="0.00" required autoFocus />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Pay From Account (Expense)</Label>
                                        <Select name="sourceAccountId" required>
                                            <SelectTrigger><SelectValue placeholder="Select Source Account" /></SelectTrigger>
                                            <SelectContent>
                                                {fundingAccounts.length > 0 ? fundingAccounts.map(acc => (
                                                    <SelectItem key={acc.id} value={acc.id}>{acc.name} (${Number(acc.balance).toLocaleString()})</SelectItem>
                                                )) : <SelectItem value="none" disabled>No funding accounts available</SelectItem>}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Confirm Payment</Button>
                                </form>
                            )}
                        </DialogContent>
                    </Dialog>

                </TabsContent>

                {/* Goals Content */}
                <TabsContent value="goals" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-3">
                        {goals.map((goal, i) => {
                            const progress = goal.targetAmount > 0 ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100 : 0
                            return (
                                <Card key={goal.id} className="relative overflow-hidden">
                                    <CardHeader>
                                        <div className="flex justify-between">
                                            <CardTitle className="text-lg">{goal.name}</CardTitle>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteGoal(goal.id)}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
                                        </div>
                                        <CardDescription>Target: ${Number(goal.targetAmount).toLocaleString()}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-center py-6">
                                            <div className="relative h-32 w-32 flex items-center justify-center rounded-full border-8 border-muted">
                                                <div className="text-center">
                                                    <span className="block text-xl font-bold">{Math.round(progress)}%</span>
                                                </div>
                                                <svg className="absolute inset-0 -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                                                    <circle
                                                        cx="50" cy="50" r="46"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        className={goal.color ? goal.color.replace('bg-', 'text-') : "text-emerald-500"} // Simple convert bg to text for stroke
                                                        strokeDasharray={`${(Math.min(progress, 100) / 100) * 289} 289`}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="text-center font-medium">
                                            ${Number(goal.currentAmount).toLocaleString()} saved
                                        </div>
                                        {goal.deadline && (
                                            <p className="text-xs text-center text-muted-foreground mt-2">
                                                Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                            </p>
                                        )}
                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                className="flex-1"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingGoal(goal)
                                                    setIsEditGoalOpen(true)
                                                }}
                                            >
                                                <Pencil className="w-4 h-4 mr-2" /> Edit
                                            </Button>
                                            <Button
                                                className="flex-1"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setContributeGoal(goal)
                                                    setIsContributeOpen(true)
                                                }}
                                            >
                                                <DollarSign className="w-4 h-4 mr-2" /> Add
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}

                        <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
                            <DialogTrigger asChild>
                                <Card className="flex flex-col items-center justify-center border-dashed cursor-pointer hover:bg-muted/50 transition-colors py-12">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                                        <Target className="text-muted-foreground" />
                                    </div>
                                    <p className="font-medium">Add New Goal</p>
                                </Card>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Financial Goal</DialogTitle>
                                </DialogHeader>
                                <form action={handleCreateGoal} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Goal Name</Label>
                                        <Input name="name" placeholder="Emergency Fund, New Car..." required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Target Amount</Label>
                                            <Input name="targetAmount" type="number" step="0.01" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Current Saved</Label>
                                            <Input name="currentAmount" type="number" step="0.01" defaultValue="0" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Deadline (Optional)</Label>
                                        <Input name="deadline" type="date" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Color</Label>
                                        <Select name="color" defaultValue="bg-emerald-500">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bg-emerald-500">Emerald</SelectItem>
                                                <SelectItem value="bg-blue-500">Blue</SelectItem>
                                                <SelectItem value="bg-purple-500">Purple</SelectItem>
                                                <SelectItem value="bg-orange-500">Orange</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="submit" className="w-full">Create Goal</Button>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Edit Goal Dialog */}
                        <Dialog open={isEditGoalOpen} onOpenChange={setIsEditGoalOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Goal</DialogTitle>
                                </DialogHeader>
                                {editingGoal && (
                                    <form action={handleUpdateGoal} className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Goal Name</Label>
                                            <Input name="name" defaultValue={editingGoal.name} required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Target Amount</Label>
                                                <Input name="targetAmount" type="number" step="0.01" defaultValue={Number(editingGoal.targetAmount)} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Current Saved</Label>
                                                <Input name="currentAmount" type="number" step="0.01" defaultValue={Number(editingGoal.currentAmount)} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Deadline (Optional)</Label>
                                            <Input name="deadline" type="date" defaultValue={editingGoal.deadline ? new Date(editingGoal.deadline).toISOString().split('T')[0] : ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Color</Label>
                                            <Select name="color" defaultValue={editingGoal.color}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="bg-emerald-500">Emerald</SelectItem>
                                                    <SelectItem value="bg-blue-500">Blue</SelectItem>
                                                    <SelectItem value="bg-purple-500">Purple</SelectItem>
                                                    <SelectItem value="bg-orange-500">Orange</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button type="submit" className="w-full">Update Goal</Button>
                                    </form>
                                )}
                            </DialogContent>
                        </Dialog>

                        {/* Contribute Goal Dialog */}
                        <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Contribute to Goal</DialogTitle>
                                    <CardDescription>Move money to your savings goal.</CardDescription>
                                </DialogHeader>
                                {contributeGoal && (
                                    <form action={handleContributeGoal} className="space-y-4 py-4">
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg mb-4 text-emerald-800 dark:text-emerald-300">
                                            <p className="text-sm font-medium">Goal: <span className="font-bold">{contributeGoal.name}</span></p>
                                            <div className="flex justify-between text-xs mt-1">
                                                <span>Saved: ${Number(contributeGoal.currentAmount).toLocaleString()}</span>
                                                <span>Target: ${Number(contributeGoal.targetAmount).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Contribution Amount</Label>
                                            <Input name="amount" type="number" step="0.01" placeholder="0.00" required autoFocus />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>From Account (Source)</Label>
                                            <Select name="sourceAccountId">
                                                <SelectTrigger><SelectValue placeholder="Select Source Account" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None (External)</SelectItem>
                                                    {fundingAccounts.length > 0 ? fundingAccounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id}>{acc.name} (${Number(acc.balance).toLocaleString()})</SelectItem>
                                                    )) : null}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-muted-foreground">Where is the money coming from?</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>To Account (Destination / Savings)</Label>
                                            <Select name="destinationAccountId">
                                                <SelectTrigger><SelectValue placeholder="Select Destination Account" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None (Just track)</SelectItem>
                                                    {fundingAccounts.length > 0 ? fundingAccounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id}>{acc.name} (${Number(acc.balance).toLocaleString()})</SelectItem>
                                                    )) : null}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-muted-foreground">Where will the money be held?</p>
                                        </div>

                                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Add Savings</Button>
                                    </form>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </TabsContent>

            </Tabs>
        </motion.div>
    )
}

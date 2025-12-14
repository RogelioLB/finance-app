"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Target, TrendingDown, CalendarDays, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { createSubscription, deleteSubscription } from "@/lib/actions/tools"
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

interface ToolsClientProps {
    subscriptions: any[]
    accounts: any[]
}

export function ToolsClient({ subscriptions, accounts }: ToolsClientProps) {
    const [isAddSubOpen, setIsAddSubOpen] = useState(false)

    const handleCreateSubscription = async (formData: FormData) => {
        await createSubscription(formData)
        setIsAddSubOpen(false)
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

                {/* Debts Content (Static for now, can be updated later) */}
                <TabsContent value="debts" className="space-y-4">
                    <p className="text-muted-foreground">Debt tracking coming soon with real data integration.</p>
                </TabsContent>

                {/* Goals Content (Static for now) */}
                <TabsContent value="goals" className="space-y-4">
                    <p className="text-muted-foreground">Goal tracking coming soon with real data integration.</p>
                </TabsContent>

            </Tabs>
        </motion.div>
    )
}

"use client"

import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Laptop, Coffee, Heart } from "lucide-react"

export default function SettingsPage() {
    const { setTheme, theme } = useTheme()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl space-y-8"
        >
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your preferences and support the project.</p>
            </div>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how FinanceFlow looks on your device.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <div className="flex flex-wrap gap-4">
                            <Button
                                variant={theme === 'light' ? 'default' : 'outline'}
                                onClick={() => setTheme("light")}
                                className="w-32 justify-start gap-2"
                            >
                                <Sun size={16} /> Light
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                onClick={() => setTheme("dark")}
                                className="w-32 justify-start gap-2"
                            >
                                <Moon size={16} /> Dark
                            </Button>
                            <Button
                                variant={theme === 'system' ? 'default' : 'outline'}
                                onClick={() => setTheme("system")}
                                className="w-32 justify-start gap-2"
                            >
                                <Laptop size={16} /> System
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Set your default currency and localization.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2 max-w-sm">
                        <Label htmlFor="currency">Default Currency</Label>
                        <Select defaultValue="usd">
                            <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="mxn">MXN ($)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Support / Donation */}
            <Card className="border-indigo-500/50 bg-gradient-to-br from-indigo-500/10 to-transparent">
                <CardHeader>
                    <div className="flex items-center gap-2 text-indigo-500 mb-2">
                        <Heart className="fill-current" />
                        <span className="font-bold uppercase tracking-wider text-xs">Support the Project</span>
                    </div>
                    <CardTitle>Donation Management</CardTitle>
                    <CardDescription>
                        FinanceFlow is free and open-source software (Donationware). Your contribution keeps the servers running and development active.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Card className="flex-1 bg-background hover:border-indigo-500 cursor-pointer transition-colors shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <Coffee className="h-8 w-8 mb-4 text-orange-500" />
                                <h3 className="font-bold">Buy me a Coffee</h3>
                                <p className="text-sm text-muted-foreground">$5.00 One-time</p>
                            </CardContent>
                        </Card>
                        <Card className="flex-1 bg-background hover:border-indigo-500 cursor-pointer transition-colors shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <Heart className="h-8 w-8 mb-4 text-red-500" />
                                <h3 className="font-bold">Become a Sponsor</h3>
                                <p className="text-sm text-muted-foreground">$10.00 / month</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Manage Contributions</Button>
                </CardFooter>
            </Card>

        </motion.div>
    )
}

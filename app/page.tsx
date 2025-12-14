"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, PieChart, ShieldCheck, Wallet, TrendingUp, Coffee } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">

            {/* Navbar */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Wallet className="text-white w-5 h-5" />
                    </div>
                    <span>FinanceFlow</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">See Demo</Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 lg:py-32 px-6 flex flex-col items-center text-center">
                    {/* Ambient Background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full -z-10 pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl space-y-6"
                    >
                        <Badge variant="outline" className="px-4 py-1 border-indigo-500/50 text-indigo-500 rounded-full">
                            v1.0 Public Beta
                        </Badge>
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Master your Money.
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Stop wondering where your money went. Track, budget, and grow your wealth with a privacy-first, donation-supported platform.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <Link href="/dashboard">
                                <Button size="lg" className="h-12 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25 shadow-xl transition-all hover:scale-105">
                                    Start for Free <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full border-2 hover:bg-accent transition-all">
                                    View Live Demo
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Hero Visual/Abstract */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mt-16 w-full max-w-5xl mx-auto relative"
                    >
                        <div className="relative aspect-video rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden flex items-center justify-center group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 w-full max-w-4xl opacity-80 group-hover:opacity-100 transition-opacity">
                                {/* Mock Cards for visual */}
                                <div className="h-32 bg-card rounded-xl border shadow-sm p-4 animate-pulse"></div>
                                <div className="h-32 bg-card rounded-xl border shadow-sm p-4 animate-pulse delay-75"></div>
                                <div className="h-32 bg-card rounded-xl border shadow-sm p-4 animate-pulse delay-150"></div>
                                <div className="col-span-1 md:col-span-2 h-48 bg-card rounded-xl border shadow-sm p-4 animate-pulse delay-200"></div>
                                <div className="h-48 bg-card rounded-xl border shadow-sm p-4 animate-pulse delay-300"></div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Features Grid (Bento) */}
                <section className="py-20 px-6 bg-muted/30">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16 space-y-2">
                            <h2 className="text-3xl font-bold">Everything you need</h2>
                            <p className="text-muted-foreground">Four powerful tools to manage your financial life.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
                            {/* Feature 1: Large Span */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="md:col-span-2 row-span-2"
                            >
                                <Card className="h-full bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/20 overflow-hidden relative">
                                    <CardHeader>
                                        <div className="p-3 bg-indigo-500/10 w-fit rounded-lg mb-2 text-indigo-500"><TrendingUp size={24} /></div>
                                        <CardTitle className="text-2xl">Smart Budgeting</CardTitle>
                                        <CardDescription className="text-base">Visualize your spending patterns with beautiful interactive charts.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Abstract Chart Graphic */}
                                        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 opacity-10 translate-x-10 translate-y-10">
                                            <PieChart size={300} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Feature 2 */}
                            <motion.div whileHover={{ y: -5 }}>
                                <Card className="h-full">
                                    <CardHeader>
                                        <div className="p-3 bg-pink-500/10 w-fit rounded-lg mb-2 text-pink-500"><Wallet size={24} /></div>
                                        <CardTitle>Debt Snowball</CardTitle>
                                        <CardDescription>Crush your loans with the snowball method.</CardDescription>
                                    </CardHeader>
                                </Card>
                            </motion.div>

                            {/* Feature 3 */}
                            <motion.div whileHover={{ y: -5 }}>
                                <Card className="h-full">
                                    <CardHeader>
                                        <div className="p-3 bg-emerald-500/10 w-fit rounded-lg mb-2 text-emerald-500"><ShieldCheck size={24} /></div>
                                        <CardTitle>Secure Vault</CardTitle>
                                        <CardDescription>Your data is encrypted and local-first.</CardDescription>
                                    </CardHeader>
                                </Card>
                            </motion.div>

                            {/* Feature 4: Wide */}
                            <motion.div whileHover={{ y: -5 }} className="md:col-span-3">
                                <Card className="h-full bg-card/50 backdrop-blur">
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="p-3 bg-amber-500/10 w-fit rounded-lg text-amber-500"><PieChart size={24} /></div>
                                        <div>
                                            <CardTitle>Subscription Tracker</CardTitle>
                                            <CardDescription>Never pay for an unused subscription again.</CardDescription>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Donation Section */}
                <section className="py-24 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-600 -skew-y-3 origin-bottom-right z-0 transform scale-110" />
                    <div className="max-w-4xl mx-auto relative z-10 text-center text-white space-y-8">
                        <h2 className="text-4xl font-bold">Pro Features. Zero Price Tag.</h2>
                        <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
                            We believe financial freedom shouldn't have a paywall. This project is 100% free and open-source.
                            If it helps you save money, consider buying me a coffee to keep the servers running.
                        </p>
                        <div className="flex justify-center flex-wrap gap-4">
                            <Button size="lg" className="h-14 px-8 text-lg bg-white text-indigo-600 hover:bg-indigo-50 hover:scale-105 transition-all rounded-full shadow-2xl">
                                <Coffee className="mr-2 h-5 w-5" /> Buy me a Coffee
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/30 text-white bg-transparent hover:bg-white/10 rounded-full">
                                View Source Code
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-border/40 text-center text-sm text-muted-foreground">
                <div className="flex justify-center gap-6 mb-4">
                    <Link href="#" className="hover:text-foreground">Twitter</Link>
                    <Link href="#" className="hover:text-foreground">GitHub</Link>
                    <Link href="#" className="hover:text-foreground">Terms</Link>
                </div>
                <p>© 2024 FinanceFlow. Built with ❤️ for the community.</p>
            </footer>

        </div>
    )
}

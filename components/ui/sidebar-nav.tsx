"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, CreditCard, Wallet, Wrench, Settings, Menu, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { ModeToggle } from "./mode-toggle"

interface SidebarNavProps {
    className?: string
}

export function SidebarNav({ className }: SidebarNavProps) {
    const pathname = usePathname()
    // By default collapsed on desktop to just icons, expanded on mobile overlay?
    // User requested: "Expandable sidebar... absolute on mobile"
    const [isExpanded, setIsExpanded] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Toggle for desktop expansion
    const toggleExpand = () => setIsExpanded(!isExpanded)

    // Toggle for mobile open
    const toggleMobile = () => setIsMobileOpen(!isMobileOpen)

    const links = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/dashboard/accounts", icon: Wallet, label: "Accounts" },
        { href: "/dashboard/transactions", icon: CreditCard, label: "Transactions" },
        { href: "/dashboard/tools", icon: Wrench, label: "Tools" },
        { href: "/dashboard/advisor", icon: Sparkles, label: "Advisor" },
        { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ]

    return (
        <>
            {/* Mobile Trigger (Hamburger) - Visible only when sidebar is closed on mobile */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button variant="outline" size="icon" onClick={toggleMobile} className={cn("rounded-full shadow-lg bg-background/80 backdrop-blur-md", isMobileOpen && "hidden")}>
                    <Menu className="w-5 h-5" />
                </Button>
            </div>

            {/* Mobile Overlay Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={cn(
                "fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col items-center py-4",
                // Desktop sizing
                isExpanded ? "md:w-64" : "md:w-20",
                // Mobile sizing and positioning
                isMobileOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>

                {/* Logo / Brand Icon */}
                <div className="mb-6 w-full flex justify-center">
                    <div className={cn("h-12 w-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-indigo-500/20 shadow-lg transition-all", isExpanded ? "rounded-xl" : "rounded-3xl hover:rounded-xl")}>
                        <CreditCard className="text-white w-6 h-6" />
                    </div>
                </div>

                <Separator className="bg-slate-700 w-10 mb-4" />

                {/* Navigation Links */}
                <ScrollArea className="flex-1 w-full px-2">
                    <div className="flex flex-col gap-2 w-full items-center">
                        {links.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={cn(
                                        "relative group flex items-center transition-all duration-200",
                                        // Shape: Discord Pill logic
                                        "h-12 w-12 md:h-12 md:w-12 rounded-[24px] hover:rounded-[16px] hover:bg-indigo-500 hover:text-white justify-center",
                                        isActive ? "bg-indigo-500 text-white rounded-[16px]" : "bg-slate-800 text-slate-400",
                                        // Expanded styles override
                                        (isExpanded || isMobileOpen) && "w-full justify-start px-4 gap-4 rounded-xl hover:rounded-xl"
                                    )}
                                >
                                    {/* Active Indicator Strip (Left) - Only when collapsed */}
                                    {isActive && !isExpanded && !isMobileOpen && (
                                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                                    )}
                                    {/* Hover Indicator Strip (Left) - Only when collapsed */}
                                    {!isActive && !isExpanded && !isMobileOpen && (
                                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full opacity-0 group-hover:opacity-100 transition-all duration-200 scale-0 group-hover:scale-100 origin-left" />
                                    )}

                                    <Icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive && "scale-105")} />

                                    {/* Label: Visible only when expanded */}
                                    <span className={cn(
                                        "font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                                        (isExpanded || isMobileOpen) ? "w-auto opacity-100" : "w-0 opacity-0 hidden"
                                    )}>
                                        {link.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </ScrollArea>

                {/* Footer Actions */}
                <div className="mt-auto flex flex-col items-center gap-4 w-full pb-2">
                    <ModeToggle />

                    {/* Collapse Toggle (Desktop Only) */}
                    <button
                        onClick={toggleExpand}
                        className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                    >
                        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

            </div>
        </>
    )
}

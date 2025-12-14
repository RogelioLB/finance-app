"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PieChart, CreditCard, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
    const pathname = usePathname()

    const links = [
        {
            href: "/dashboard",
            icon: Home,
            label: "Inicio",
            active: pathname === "/dashboard",
        },
        {
            href: "/dashboard/transactions",
            icon: CreditCard,
            label: "Transacciones",
            active: pathname === "/dashboard/transactions",
        },
        {
            href: "/dashboard/stats",
            icon: PieChart,
            label: "Estadísticas",
            active: pathname === "/dashboard/stats",
        },
        {
            href: "/dashboard/profile",
            icon: User,
            label: "Perfil",
            active: pathname === "/dashboard/profile",
        },
    ]

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[760px] z-50">
            <nav className="flex items-center justify-around h-16 rounded-2xl border bg-background/60 backdrop-blur-xl shadow-lg px-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200",
                            link.active
                                ? "text-primary scale-110"
                                : "text-muted-foreground/60 hover:text-primary/70"
                        )}
                    >
                        <div className={cn(
                            "p-2 rounded-xl transition-all",
                            link.active ? "bg-primary/10" : "bg-transparent"
                        )}>
                            <link.icon className="w-5 h-5" />
                        </div>
                    </Link>
                ))}
            </nav>
        </div>
    )
}

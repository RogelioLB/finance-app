import { cn } from "@/lib/utils"

interface AccountCardProps {
    name: string
    balance: number
    type: "bank" | "cash" | "savings" | "investment" | "credit_card" | "loan"
    creditLimit?: number
    colorVariant?: string
    className?: string
    currency?: string
}

export function AccountCard({
    name,
    balance,
    type,
    creditLimit,
    cutoffDay,
    paymentDay,
    colorVariant = "black",
    className,
    currency = "USD",
}: AccountCardProps & { cutoffDay?: number, paymentDay?: number }) {

    const variants: Record<string, string> = {
        black: "bg-zinc-900 text-white dark:bg-zinc-950 border-zinc-800",
        blue: "bg-blue-600 text-white border-blue-500",
        purple: "bg-purple-600 text-white border-purple-500",
        green: "bg-emerald-600 text-white border-emerald-500",
        red: "bg-red-600 text-white border-red-500",
        gradient: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-transparent",
    }

    const isCredit = type === 'credit_card'
    const availableCredit = creditLimit ? creditLimit - balance : 0
    // progress bar for usage
    const progress = creditLimit ? (balance / creditLimit) * 100 : 0

    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl p-6 shadow-md transition-transform duration-300 hover:scale-[1.02] border h-full",
            variants[colorVariant] || variants.black,
            className
        )}>
            {/* Abstract Background/Shine */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>

            <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
                <div className="flex justify-between items-start">
                    <p className="text-sm font-medium opacity-80 uppercase tracking-wider">{type.replace('_', ' ')}</p>
                    {isCredit && <p className="text-xs opacity-70">Credit</p>}
                    {type === 'bank' && <div className="h-8 w-12 bg-white/20 rounded-md"></div>}
                </div>

                <div className="mt-4">
                    <p className="text-3xl font-bold tracking-tight">
                        {currency === 'USD' ? '$' : currency} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm opacity-70 mt-1 flex justify-between">
                        <span>{name}</span>
                        {isCredit && <span className="text-xs opacity-60 self-center">Debt / To Pay</span>}
                    </p>
                </div>

                <div className="mt-4">
                    {isCredit && creditLimit ? (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs opacity-80">
                                    <span>Available</span>
                                    <span>${availableCredit.toLocaleString()} / ${creditLimit.toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white/80 rounded-full"
                                        style={{ width: `${Math.min(100, (availableCredit / creditLimit) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            {(cutoffDay || paymentDay) && (
                                <div className="flex justify-between text-xs opacity-70 border-t border-white/10 pt-2">
                                    {cutoffDay && <span>Cut-off: {cutoffDay}th</span>}
                                    {paymentDay && <span>Deadline: {paymentDay}th</span>}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs opacity-50 mt-auto">Verified Account</p>
                    )}
                </div>
            </div>
        </div>
    )
}

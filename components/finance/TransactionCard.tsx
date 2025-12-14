import { LucideIcon, ArrowUpRight, ArrowDownLeft, Store } from "lucide-react"
import { cn } from "@/lib/utils"

interface TransactionCardProps {
  payee: string
  amount: number
  date: string
  category: string
  icon?: LucideIcon
  type?: "income" | "expense"
  className?: string
}

export function TransactionCard({
  payee,
  amount,
  date,
  category,
  icon: Icon = Store,
  type = "expense",
  className,
}: TransactionCardProps) {
  const isExpense = type === "expense"
  
  return (
    <div className={cn("flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors", className)}>
      <div className="flex items-center gap-4">
        <div className={cn("p-2 rounded-full", isExpense ? "bg-red-100 dark:bg-red-900/20 text-red-600" : "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600")}>
          <Icon size={20} />
        </div>
        <div>
          <p className="font-medium">{payee}</p>
          <p className="text-sm text-muted-foreground">{category} • {date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("font-bold", isExpense ? "text-red-600 dark:text-red-500" : "text-emerald-600 dark:text-emerald-500")}>
          {isExpense ? "-" : "+"}${Math.abs(amount).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

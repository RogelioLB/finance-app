import { getFinancialAdvisorData } from "@/lib/actions/financial-advisor"
import { AdvisorClient } from "./advisor-client"
import { redirect } from "next/navigation"

export default async function AdvisorPage() {
    const data = await getFinancialAdvisorData()

    if (!data) {
        redirect("/sign-in")
    }

    return (
        <AdvisorClient
            summary={data.summary}
            debts={data.debts}
            goals={data.goals}
            advice={data.advice}
            projectedNetWorth={data.projectedNetWorth}
        />
    )
}

import { SidebarNav } from "@/components/ui/sidebar-nav"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <SidebarNav />
            <main className="flex-1 md:ml-20 transition-all duration-300 md:peer-checked:ml-64 p-4 pt-20 md:p-8 overflow-x-hidden">
                {/* 
                   Note: The margin-left needs to match the collapsed sidebar width (5rem / 80px -> w-20).
                   If the sidebar expands, this margin needs to adjust. 
                   Since SidebarNav handles its own state, we might have a slight overlap or gap issue if not coordinated.
                   For now, we use a safe md:ml-20 (collapsed state) and let the content flow. 
                   Ideally, SidebarNav should lift state up or use Context, but we'll stick to simple layout for now.
                   The sidebar is 'fixed', so main content needs margin.
                */}
                <div className="max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    )
}

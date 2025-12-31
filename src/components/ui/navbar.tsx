import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Link } from "@tanstack/react-router"

function Nav({ children }: { children: React.ReactNode }) {
    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-fit bg-background/50 backdrop-blur-md border rounded-xl shadow-sm">
            <div className="flex items-center justify-between p-2 gap-2">
                {children}
            </div>
        </nav>
    )
}

function NavItem({
    to,
    icon,
    tooltip,
}: {
    to: string
    icon: React.ReactNode
    tooltip?: string
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Link
                    to={to}
                    activeProps={{
                        className: "bg-primary hover:bg-primary text-primary-foreground"
                    }}
                    inactiveProps={{
                        className: "hover:bg-primary/10"
                    }}
                    className="flex items-center gap-2 p-4 py-2 font-semibold rounded-md active:scale-95 transition-all"
                >
                    {icon}
                </Link>
            </TooltipTrigger>
            <TooltipContent sideOffset={10} className="font-bold">
                {tooltip}
            </TooltipContent>
        </Tooltip>
    )
}

export { Nav, NavItem }
import type { LucideIcon } from "lucide-react"
import { Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import type { ReactNode } from "react"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
    children?: ReactNode
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    children
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm text-center">
                {description}
            </p>
            {children}
            {actionLabel && onAction && (
                <Button onClick={onAction} className="mt-2 font-bold uppercase text-[10px] tracking-widest rounded-xl">
                    <Plus className="mr-2 h-4 w-4" />
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}

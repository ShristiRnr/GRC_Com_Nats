'use client'

import { formatDistanceToNow } from 'date-fns'
import {
    ClipboardCheck,
    Send,
    CheckCircle,
    AlertCircle,
    Clock,
    AlertTriangle,
    Rocket,
    Flag,
    ShieldAlert,
    AlertOctagon,
    UserCog,
    FileQuestion,
    Bell,
    ArrowRight,
} from 'lucide-react'
import { cn } from '~/lib/utils' // Absolute import
import { markAsRead, type Notification } from '~/lib/api/notifications' // Absolute import
import { useNavigate } from 'react-router'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'clipboard-check': ClipboardCheck,
    'send': Send,
    'check-circle': CheckCircle,
    'check-circle-2': CheckCircle,
    'alert-circle': AlertCircle,
    'clock': Clock,
    'alert-triangle': AlertTriangle,
    'rocket': Rocket,
    'flag': Flag,
    'shield-alert': ShieldAlert,
    'alert-octagon': AlertOctagon,
    'user-cog': UserCog,
    'file-question': FileQuestion,
}

const iconStyles: Record<string, { bg: string; fg: string }> = {
    'rocket': { bg: 'bg-blue-50 dark:bg-blue-950/40', fg: 'text-blue-600 dark:text-blue-400' },
    'clipboard-check': { bg: 'bg-blue-50 dark:bg-blue-950/40', fg: 'text-blue-600 dark:text-blue-400' },
    'send': { bg: 'bg-sky-50 dark:bg-sky-950/40', fg: 'text-sky-600 dark:text-sky-400' },
    'check-circle': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', fg: 'text-emerald-600 dark:text-emerald-400' },
    'check-circle-2': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', fg: 'text-emerald-600 dark:text-emerald-400' },
    'alert-circle': { bg: 'bg-red-50 dark:bg-red-950/40', fg: 'text-red-600 dark:text-red-400' },
    'clock': { bg: 'bg-amber-50 dark:bg-amber-950/40', fg: 'text-amber-600 dark:text-amber-400' },
    'alert-triangle': { bg: 'bg-amber-50 dark:bg-amber-950/40', fg: 'text-amber-600 dark:text-amber-400' },
    'flag': { bg: 'bg-orange-50 dark:bg-orange-950/40', fg: 'text-orange-600 dark:text-orange-400' },
    'shield-alert': { bg: 'bg-red-50 dark:bg-red-950/40', fg: 'text-red-600 dark:text-red-400' },
    'alert-octagon': { bg: 'bg-red-50 dark:bg-red-950/40', fg: 'text-red-600 dark:text-red-400' },
    'user-cog': { bg: 'bg-violet-50 dark:bg-violet-950/40', fg: 'text-violet-600 dark:text-violet-400' },
    'file-question': { bg: 'bg-amber-50 dark:bg-amber-950/40', fg: 'text-amber-600 dark:text-amber-400' },
}

const defaultIconStyle = { bg: 'bg-muted', fg: 'text-muted-foreground' }

interface NotificationItemProps {
    notification: Notification
    onRead?: (id: string) => void
    onClose?: () => void
}

export function NotificationItem({ notification, onRead, onClose }: NotificationItemProps) {
    const navigate = useNavigate()
    const isUnread = !notification.read_at

    const iconKey = notification.icon || ''
    const Icon = iconMap[iconKey] || Bell
    const style = iconStyles[iconKey] || defaultIconStyle

    const handleClick = async () => {
        if (isUnread) {
            await markAsRead(notification.id)
            onRead?.(notification.id)
        }
        if (notification.link) {
            onClose?.()
            navigate(notification.link)
        }
    }

    const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
        addSuffix: false,
    })

    return (
        <button
            onClick={handleClick}
            className={cn(
                'group flex w-full items-start gap-3 px-4 py-3.5 text-left transition-all duration-150',
                'hover:bg-muted/60 active:bg-muted/80',
                'border-b border-border/40 last:border-b-0',
                'bg-background',
                isUnread && 'bg-primary/[0.03] dark:bg-primary/[0.06]'
            )}
        >
            {/* Icon */}
            <div
                className={cn(
                    'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg',
                    style.bg
                )}
            >
                <Icon className={cn('size-4', style.fg)} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p
                        className={cn(
                            'text-[13px] leading-snug',
                            isUnread ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'
                        )}
                    >
                        {notification.title}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                        {isUnread && (
                            <span className="size-2 rounded-full bg-primary animate-pulse" />
                        )}
                    </div>
                </div>
                <p className={cn(
                    'mt-0.5 line-clamp-2 text-xs leading-relaxed',
                    isUnread ? 'text-muted-foreground' : 'text-muted-foreground/70'
                )}>
                    {notification.body}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-muted-foreground/60">{timeAgo}</span>
                    {notification.link && (
                        <span className="flex items-center gap-0.5 text-[11px] text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity">
                            View <ArrowRight className="size-2.5" />
                        </span>
                    )}
                </div>
            </div>
        </button>
    )
}

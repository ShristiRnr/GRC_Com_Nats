'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Check, ChevronRight } from 'lucide-react'
import { Button } from '~/components/ui/button' // Absolute import
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '~/components/ui/popover' // Absolute import
import { ScrollArea } from '~/components/ui/scroll-area' // Absolute import
import { cn } from '~/lib/utils' // Absolute import
import { NotificationItem } from './notification-item'
import {
    getNotifications,
    getUnreadCount,
    markAllAsRead,
    type Notification
} from '~/lib/api/notifications' // Absolute import

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const fetchNotifications = useCallback(async () => {
        try {
            const [notificationsResult, count] = await Promise.all([
                getNotifications({ limit: 5 }),
                getUnreadCount()
            ])
            setNotifications(notificationsResult.data)
            setUnreadCount(count)
        } catch (error) {
            console.error('[Notifications] Fetch error:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    useEffect(() => {
        if (isOpen) {
            fetchNotifications()
        }
    }, [isOpen, fetchNotifications])

    const handleMarkAllRead = async () => {
        await markAllAsRead()
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
        )
        setUnreadCount(0)
    }

    const handleNotificationRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, read_at: new Date().toISOString() } : n
            )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative size-10 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70"
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-sidebar">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[380px] p-0 shadow-xl border border-border/50 rounded-xl overflow-hidden"
                align="end"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between bg-muted/30 px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                            onClick={handleMarkAllRead}
                        >
                            <Check className="size-3" />
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <ScrollArea className="max-h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <div className="rounded-full bg-muted p-3 mb-3">
                                <Bell className="size-5 opacity-40" />
                            </div>
                            <p className="text-sm font-medium">All caught up!</p>
                            <p className="text-xs mt-1 text-muted-foreground/70">No new notifications</p>
                        </div>
                    ) : (
                        <div>
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={handleNotificationRead}
                                    onClose={() => setIsOpen(false)}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="border-t bg-muted/20">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-10 text-xs font-medium text-muted-foreground hover:text-foreground gap-1 rounded-none"
                            onClick={() => {
                                setIsOpen(false)
                                window.location.href = '/notifications'
                            }}
                        >
                            View all notifications
                            <ChevronRight className="size-3" />
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}

'use client'

import { HelpCircle, Search } from 'lucide-react'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { ThemeToggle } from '~/components/theme-toggle'
import { NotificationBell } from '~/components/notifications/notification-bell'

export function Header() {
    return (
        <header className="h-16 flex items-center justify-between px-8 bg-sidebar border-b border-sidebar-border text-sidebar-foreground shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/50 size-5" />
                    <Input
                        className="w-full bg-sidebar-accent/50 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus-visible:ring-1 focus-visible:ring-primary placeholder:text-sidebar-foreground/50 text-sidebar-foreground"
                        placeholder="Search frameworks, controls, or risks..."
                        type="text"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <NotificationBell />

                <ThemeToggle />

                <Button variant="ghost" size="icon" className="size-10 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70">
                    <HelpCircle className="size-5" />
                </Button>

                <div className="h-6 w-px bg-sidebar-border mx-2"></div>

                <div className="text-right hidden sm:block">
                    <p className="text-xs text-sidebar-foreground/50">Environment</p>
                    <p className="text-sm font-medium text-primary capitalize">
                        {import.meta.env.VITE_APP_ENV || 'Production'}
                    </p>
                </div>
            </div>
        </header>
    )
}

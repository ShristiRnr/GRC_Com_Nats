'use client'

import { Link, NavLink, useLocation, useNavigate, useRouteLoaderData } from 'react-router'
import { cn } from '~/lib/utils'
import {
    LayoutDashboard,
    Book,
    Network,
    ClipboardList,
    AlertTriangle,
    FileText,
    Box,
    Briefcase,
    Settings,
    LogOut,
    BarChart3
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Separator } from '~/components/ui/separator'
import { api, type User } from '~/lib/api'

const sidebarGroups = [
    {
        label: "Platform",
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: BarChart3, label: 'Compliance Status', href: '/dashboard/compliance-status' },
            { icon: ClipboardList, label: 'Tasks', href: '/tasks' },
            { icon: Briefcase, label: 'Programs', href: '/programs' },
        ]
    },
    {
        label: "Compliance",
        items: [
            { icon: Book, label: 'Controls', href: '/controls' },
            { icon: Network, label: 'Frameworks', href: '/frameworks' },
            { icon: FileText, label: 'Policies', href: '/policies' },
        ]
    },
    {
        label: "Risk & Assets",
        items: [
            { icon: AlertTriangle, label: 'Risks', href: '/risks' },
            { icon: Box, label: 'Assets', href: '/assets' },
        ]
    }
]

export function Sidebar() {
    const location = useLocation()
    const pathname = location.pathname
    const navigate = useNavigate()

    // Get user data from protected layout loader
    const data = useRouteLoaderData("routes/protected") as { user: User } | undefined
    const user = data?.user

    const handleSignOut = async () => {
        try {
            await api.logout()
            navigate('/login')
        } catch (error) {
            console.error("Logout failed", error)
            navigate('/login')
        }
    }

    return (
        <aside className="w-64 flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border hidden lg:flex h-screen sticky top-0 transition-all duration-300">
            {/* Header */}
            <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
                <div className="relative w-full h-8 flex items-center">
                    <img
                        src="/grcompli-logo.svg"
                        alt="GRCompli Logo"
                        height={32}
                        width={120}
                        className="object-contain object-left h-full w-auto"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border">
                {sidebarGroups.map((group) => (
                    <div key={group.label} className="space-y-2">
                        <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                            {group.label}
                        </h3>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) && item.href !== '/'
                                return (
                                    <NavLink
                                        key={item.href}
                                        to={item.href}
                                        className={({ isActive: rrIsActive }) => cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative",
                                            isActive || rrIsActive
                                                ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-md"
                                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                        )}
                                    >
                                        <item.icon className={cn("size-4.5 transition-colors", isActive ? "text-sidebar-primary-foreground" : "current-color opacity-70 group-hover:opacity-100")} />
                                        <span className="text-sm">{item.label}</span>
                                    </NavLink>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-sidebar-border space-y-2 bg-sidebar/30">
                <NavLink
                    to="/settings"
                    className={({ isActive }) => cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors group",
                        isActive && "bg-sidebar-accent text-sidebar-foreground"
                    )}
                >
                    <Settings className="size-4.5 opacity-70 group-hover:opacity-100" />
                    <span className="text-sm font-medium">Settings</span>
                </NavLink>

                <Separator className="bg-sidebar-border" />

                {user ? (
                    <div className="flex items-center gap-1 group relative">
                        <Link
                            to="/settings/profile"
                            className="flex-1 flex items-center gap-3 px-2 py-2 -ml-2 rounded-md hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
                        >
                            <Avatar className="size-8 rounded-lg border border-sidebar-border shadow-sm">
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} />
                                <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-foreground font-medium">
                                    {user.username?.slice(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                                <span className="text-sm font-medium text-sidebar-foreground truncate leading-tight">
                                    {user.username}
                                </span>
                                <span className="text-xs text-sidebar-foreground/60 truncate leading-tight">
                                    {user.role}
                                </span>
                            </div>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive absolute right-0 top-1/2 -translate-y-1/2"
                            onClick={handleSignOut}
                            title="Sign out"
                        >
                            <LogOut className="size-3.5" />
                        </Button>
                    </div>
                ) : (
                    <div className="px-2 py-2 text-xs text-center text-sidebar-foreground/50">
                        Guest
                    </div>
                )}
            </div>
        </aside>
    )
}

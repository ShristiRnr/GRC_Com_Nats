'use client'

import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import {
    Users,
    Building2,
    Shield,
    Tags,
    FileText,
    KeyRound,
    ChevronRight,
    UserPlus,
    FolderTree
} from 'lucide-react'
import type { Role, User, Department } from '~/lib/api/settings'

interface SettingsCardProps {
    href: string
    icon: React.ReactNode
    title: string
    description: string
    badge?: string
    count?: number
    disabled?: boolean
}

function SettingsCard({ href, icon, title, description, badge, count, disabled }: SettingsCardProps) {
    const content = (
        <Card className={`h-full transition-all duration-200 ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-primary/50 hover:shadow-md cursor-pointer group'}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-lg bg-primary/10 ${disabled ? '' : 'group-hover:bg-primary/20'} transition-colors`}>
                        {icon}
                    </div>
                    {badge && (
                        <Badge variant="secondary" className="text-xs">
                            {badge}
                        </Badge>
                    )}
                    {typeof count === 'number' && (
                        <Badge variant="outline" className="text-xs font-mono">
                            {count}
                        </Badge>
                    )}
                </div>
                <CardTitle className={`flex items-center gap-2 text-lg mt-3 ${disabled ? '' : 'group-hover:text-primary'} transition-colors`}>
                    {title}
                    {!disabled && <ChevronRight className="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />}
                </CardTitle>
                <CardDescription className="text-sm">
                    {description}
                </CardDescription>
            </CardHeader>
        </Card>
    )

    if (disabled) {
        return <div className="block">{content}</div>
    }

    return (
        <Link to={href} className="block">
            {content}
        </Link>
    )
}

interface SettingsViewProps {
    roles: Role[]
    users: User[]
    departments: Department[]
}

export function SettingsView({ roles, users, departments }: SettingsViewProps) {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your organization, users, roles, and system configuration.
                </p>
            </div>

            {/* Personal Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                        Personal
                    </span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SettingsCard
                        href="/settings/profile"
                        icon={<UserPlus className="size-5 text-primary" />}
                        title="My Profile"
                        description="Manage your personal details, password, and compliance identity."
                    />
                </div>
            </section>

            {/* User & Access Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                        Users & Access
                    </span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SettingsCard
                        href="/settings/users"
                        icon={<Users className="size-5 text-primary" />}
                        title="User Management"
                        description="Invite users, manage roles, and configure access permissions."
                        count={users.length}
                    />

                    <SettingsCard
                        href="/settings/roles"
                        icon={<Shield className="size-5 text-primary" />}
                        title="Roles & Permissions"
                        description="Define roles and configure granular access permissions."
                        count={roles.length}
                    />

                    <SettingsCard
                        href="/settings/departments"
                        icon={<FolderTree className="size-5 text-primary" />}
                        title="Departments"
                        description="Manage organizational structure and department hierarchy."
                        count={departments.length}
                    />
                </div>
            </section>

            {/* Organization Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                        Organization
                    </span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SettingsCard
                        href="/settings/organization"
                        icon={<Building2 className="size-5 text-primary" />}
                        title="Organization Profile"
                        description="Manage organization details, logo, and contact information."
                    />

                    <SettingsCard
                        href="/settings/taxonomy"
                        icon={<Tags className="size-5 text-primary" />}
                        title="Categories & Domains"
                        description="Configure control categories and domain classifications."
                    />

                    <SettingsCard
                        href="/settings/audit-logs"
                        icon={<FileText className="size-5 text-primary" />}
                        title="Audit Logs"
                        description="View system activity and security audit trail."
                    />
                </div>
            </section>

            {/* Quick Stats */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                        Overview
                    </span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Users className="size-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{users.length}</p>
                                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Total Users</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <Shield className="size-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{roles.length}</p>
                                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Roles Defined</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200/50 dark:border-amber-800/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10">
                                    <FolderTree className="size-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{departments.length}</p>
                                    <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Departments</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950/30 dark:to-slate-900/20 border-slate-200/50 dark:border-slate-800/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-500/10">
                                    <KeyRound className="size-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                                        {roles.reduce((acc, r) => acc + (r.permissions?.length || 0), 0)}
                                    </p>
                                    <p className="text-xs text-slate-600/70 dark:text-slate-400/70">Permissions Assigned</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}

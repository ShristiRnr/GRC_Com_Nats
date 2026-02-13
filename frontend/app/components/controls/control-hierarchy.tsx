"use client"

import { useState, useEffect } from "react"
import type { Control } from "~/lib/api/controls"
import { getCategories, type Category } from "~/lib/api/categories"
import { getDomains, type Domain } from "~/lib/api/domains"
import {
    ChevronRight,
    ChevronDown,
    Shield,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Layers,
    Building2
} from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"

interface ControlHierarchyProps {
    controls: Control[]
}

export function ControlHierarchy({ controls }: ControlHierarchyProps) {
    const [domains, setDomains] = useState<Domain[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({})
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getDomains(), getCategories()]).then(([d, c]) => {
            setDomains(d)
            setCategories(c)
            setLoading(false)
        })
    }, [])

    const toggleDomain = (id: string) => {
        setExpandedDomains(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const toggleCategory = (id: string) => {
        setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }))
    }

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading hierarchy...</div>
    }

    // Group controls by Domain -> Category
    const groupedData = domains.map(domain => {
        const domainControls = controls.filter(c => c.domain?.id === domain.id)
        if (domainControls.length === 0) return null

        // Group by category within domain
        const categoryGroups = categories.map(category => {
            const categoryControls = domainControls.filter(c => c.category === category.name)
            if (categoryControls.length === 0) return null
            return {
                ...category,
                controls: categoryControls
            }
        }).filter(Boolean) as (Category & { controls: Control[] })[]

        // Controls with no category in this domain
        const uncategorized = domainControls.filter(c => !c.category)
        if (uncategorized.length > 0) {
            categoryGroups.push({
                id: `uncat-${domain.id}`,
                name: "Uncategorized",
                description: "Controls without a specific category",
                controls: uncategorized,
            } as any)
        }

        return {
            ...domain,
            categories: categoryGroups,
            totalControls: domainControls.length
        }
    }).filter(Boolean) as (Domain & { categories: (Category & { controls: Control[] })[], totalControls: number })[]

    const noDomainControls = controls.filter(c => !c.domain?.id)

    if (groupedData.length === 0 && noDomainControls.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                <Shield className="size-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">No controls found matching filter.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
            {groupedData.map(domain => (
                <div key={domain.id} className="border border-border rounded-xl bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div
                        className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleDomain(domain.id)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="transition-transform duration-200">
                                {expandedDomains[domain.id] ? <ChevronDown className="size-4 text-primary" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                            </div>
                            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Building2 className="size-4.5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground tracking-tight">{domain.name}</h3>
                                <p className="text-[11px] text-muted-foreground font-medium">{domain.description || "Core compliance domain"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-[10px] font-bold px-2.5 bg-primary/5 text-primary border-primary/10">
                                {domain.totalControls} {domain.totalControls === 1 ? 'Control' : 'Controls'}
                            </Badge>
                        </div>
                    </div>

                    {expandedDomains[domain.id] && (
                        <div className="p-4 pt-0 border-t border-border/30 bg-white/50 dark:bg-black/10">
                            <div className="mt-4 space-y-4 pl-4 border-l-2 border-primary/10 ml-4.5">
                                {domain.categories.map(category => (
                                    <div key={category.id} className="space-y-3">
                                        <div
                                            className="flex items-center gap-3 cursor-pointer hover:translate-x-1 transition-all group w-fit"
                                            onClick={() => toggleCategory(category.id)}
                                        >
                                            <div className="p-0.5 rounded-sm group-hover:bg-primary/5">
                                                {expandedCategories[category.id] ?
                                                    <ChevronDown className="size-3.5 text-primary" /> :
                                                    <ChevronRight className="size-3.5 text-muted-foreground" />
                                                }
                                            </div>
                                            <Layers className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="text-xs font-bold text-foreground leading-none">{category.name}</span>
                                            <span className="text-[10px] tabular-nums bg-muted px-1.5 py-0.5 rounded font-bold text-muted-foreground">
                                                {category.controls.length}
                                            </span>
                                        </div>

                                        {expandedCategories[category.id] && (
                                            <div className="pl-6 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                                {category.controls.map(control => (
                                                    <div key={control.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-white dark:bg-background shadow-xs hover:border-primary/30 hover:shadow-sm transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "size-1.5 rounded-full shadow-[0_0_8px]",
                                                                control.status === 'active' ? "bg-emerald-500 shadow-emerald-500/50" : "bg-amber-500 shadow-amber-500/50"
                                                            )} />
                                                            <div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs font-black font-mono text-primary/80 bg-primary/5 px-2 py-0.5 rounded">
                                                                        {control.code}
                                                                    </span>
                                                                    <span className="text-xs font-semibold text-foreground truncate max-w-[350px]">
                                                                        {control.title}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <Badge variant={control.status === 'active' ? "default" : "secondary"} className="text-[9px] font-black uppercase tracking-tighter px-2 h-4.5">
                                                                {control.status}
                                                            </Badge>
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-primary/5 hover:text-primary transition-all rounded-full">
                                                                <ChevronRight className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {noDomainControls.length > 0 && (
                <Card className="border-dashed bg-muted/10 border-border/50 rounded-xl overflow-hidden">
                    <div className="p-4 flex items-center gap-3 border-b border-dashed border-border/50">
                        <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                            <Shield className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Unassigned Controls</h3>
                            <p className="text-[10px] text-muted-foreground font-medium">Controls without a designated domain</p>
                        </div>
                    </div>
                    <div className="p-4 space-y-2">
                        {noDomainControls.map(control => (
                            <div key={control.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-white/50 dark:bg-background/20 hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="size-1.5 rounded-full bg-muted-foreground/30" />
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-black font-mono text-muted-foreground tracking-tight">{control.code}</span>
                                        <span className="text-xs font-bold text-muted-foreground/80">{control.title}</span>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground border-border/50">
                                    {control.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
}

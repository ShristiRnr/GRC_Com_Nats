import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { ArrowRight, ShieldCheck, Calendar, MoreVertical, Plus } from 'lucide-react'
import { Link } from 'react-router'
import type { Framework } from '~/lib/api/frameworks'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { deleteFramework } from '~/lib/api/frameworks'
import { toast } from 'sonner'
import { AddFrameworkDialog } from './add-framework-dialog'
import { useQueryClient } from '@tanstack/react-query'
import { frameworkKeys } from '~/hooks/queries/use-frameworks'

export function FrameworkGrid({ frameworks }: { frameworks: Framework[] }) {
    const queryClient = useQueryClient()

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this framework?')) return

        try {
            await deleteFramework(id)
            toast.success('Framework deleted')
            queryClient.invalidateQueries({ queryKey: frameworkKeys.lists() })
        } catch (error) {
            toast.error('Failed to delete framework')
        }
    }

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-emerald-500'
        if (progress >= 50) return 'bg-amber-500'
        return 'bg-red-500'
    }

    if (frameworks.length === 0) {
        return (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                    <Plus className="size-8" />
                </div>
                <h3 className="text-xl font-bold">No Frameworks Configured</h3>
                <p className="text-muted-foreground text-sm max-w-sm mt-2 mb-6">
                    Get started by adding a compliance framework like SOC2, ISO 27001, or HIPAA to your organization.
                </p>
                <AddFrameworkDialog />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frameworks.map((fw) => (
                <Link to={`/frameworks/${fw.id}`} key={fw.id} className="block h-full group">
                    <Card className="h-full flex flex-col relative transition-all duration-300 hover:shadow-lg hover:border-primary/50 group-hover:-translate-y-1">
                        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-muted" onClick={(e) => e.preventDefault()}>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link to={`/frameworks/${fw.id}`}>
                                            Manage Controls
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.preventDefault(); /* Edit logic */ }}>
                                        Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => handleDelete(fw.id, e)}>
                                        Delete Framework
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <CardHeader className="pb-3 pr-10">
                            <div className="flex justify-between items-start">
                                <div className={`size-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${(fw.progress ?? 0) >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <ShieldCheck className="size-7" />
                                </div>
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold">
                                    {fw.status || 'Active'}
                                </Badge>
                            </div>
                            <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{fw.name}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-2 text-sm leading-relaxed">
                                {fw.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4 flex-1">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                                        <span>Compliance Score</span>
                                        <span className={(fw.progress ?? 0) >= 80 ? 'text-emerald-600' : 'text-primary'}>{fw.progress ?? 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ease-out rounded-full ${getProgressColor(fw.progress ?? 0)}`}
                                            style={{ width: `${fw.progress ?? 0}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                        <div className="size-1.5 rounded-full bg-slate-400"></div>
                                        <span className="text-foreground">{fw.control_count ?? 0}</span> Controls
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                        <Calendar className="size-3.5" />
                                        <span>{new Date(fw.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 border-t bg-muted/30 mt-auto">
                            <Button variant="ghost" className="w-full justify-between text-xs font-semibold hover:bg-transparent hover:text-primary p-0 h-auto">
                                Manage Framework
                                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </CardFooter>
                    </Card>
                </Link>
            ))}
        </div>
    )
}

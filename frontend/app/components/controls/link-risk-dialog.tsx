"use client"

import { useState, useMemo, useEffect } from "react"
import { getRisks, linkRiskToControl, type Risk } from "~/lib/api/risks"
import { Button } from "~/components/ui/button"
import { AlertTriangle, Plus, Loader2, Search, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Checkbox } from "~/components/ui/checkbox"

interface LinkRiskDialogProps {
    controlId: string
    orgId?: string
    onSuccess: () => void
}

export function LinkRiskDialog({ controlId, orgId, onSuccess }: LinkRiskDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [linking, setLinking] = useState(false)
    const [risks, setRisks] = useState<Risk[]>([])
    const [search, setSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const fetchRisks = async () => {
        setLoading(true)
        try {
            const data = await getRisks(orgId || "")
            setRisks(data)
        } catch (error) {
            toast.error("Failed to load risks")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchRisks()
            setSelectedIds([])
            setSearch("")
        }
    }, [open])

    const filteredRisks = useMemo(() => {
        return risks.filter(r =>
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            (r.description || "").toLowerCase().includes(search.toLowerCase())
        )
    }, [risks, search])

    const handleLink = async () => {
        if (selectedIds.length === 0) return
        setLinking(true)
        try {
            await Promise.all(selectedIds.map(id => linkRiskToControl(id, controlId)))
            toast.success(`Linked ${selectedIds.length} risks successfully`)
            setOpen(false)
            onSuccess()
        } catch (error) {
            toast.error("Failed to link risks")
        } finally {
            setLinking(false)
        }
    }

    const toggleRisk = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const getImpactBadge = (score: number) => {
        if (score >= 15) return <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none text-[8px] font-black uppercase h-4 px-1">Critical</Badge>
        if (score >= 9) return <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none text-[8px] font-black uppercase h-4 px-1">High</Badge>
        if (score >= 4) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none text-[8px] font-black uppercase h-4 px-1">Medium</Badge>
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none text-[8px] font-black uppercase h-4 px-1">Low</Badge>
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="font-bold h-8 text-[11px] uppercase tracking-wider gap-2">
                    <Plus className="size-3.5" />
                    Link Risks
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-border bg-card shadow-2xl">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                            <AlertTriangle className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black tracking-tighter uppercase">Link Hazards</DialogTitle>
                            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                Select risks mitigated by this control
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search threats..."
                            className="pl-10 h-10 font-bold text-xs uppercase tracking-tight border-border/60 focus-visible:ring-primary/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <ScrollArea className="h-[300px] pr-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                                <Loader2 className="size-8 animate-spin text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Analyzing Risk Profile...</span>
                            </div>
                        ) : filteredRisks.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No risks found matching search</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredRisks.map((risk) => (
                                    <div
                                        key={risk.id}
                                        className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer group ${selectedIds.includes(risk.id)
                                            ? 'border-orange-500 bg-orange-50 shadow-sm shadow-orange-100'
                                            : 'border-border/40 bg-slate-50/50 hover:border-border hover:bg-white'
                                            }`}
                                        onClick={() => toggleRisk(risk.id)}
                                    >
                                        <Checkbox
                                            checked={selectedIds.includes(risk.id)}
                                            onCheckedChange={() => toggleRisk(risk.id)}
                                            className="rounded-md border-border/60 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                                                    {risk.title}
                                                </span>
                                                {getImpactBadge(risk.inherent_impact * risk.inherent_likelihood)}
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                                                <span>Rating: {risk.inherent_impact * risk.inherent_likelihood}</span>
                                                <span>•</span>
                                                <span>{risk.status}</span>
                                            </div>
                                        </div>
                                        {selectedIds.includes(risk.id) && (
                                            <CheckCircle2 className="size-4 text-orange-500 animate-in zoom-in-50 duration-300" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-border flex items-center justify-between sm:justify-between">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {selectedIds.length} {selectedIds.length === 1 ? 'Risk' : 'Risks'} Selected
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="font-bold text-xs uppercase">Cancel</Button>
                        <Button
                            size="sm"
                            disabled={selectedIds.length === 0 || linking}
                            onClick={handleLink}
                            className="font-black text-xs uppercase tracking-widest px-6 bg-orange-600 hover:bg-orange-700 text-white border-none shadow-lg shadow-orange-200"
                        >
                            {linking ? (
                                <Loader2 className="size-4 animate-spin mr-2" />
                            ) : (
                                <Plus className="size-4 mr-2" />
                            )}
                            Update Risk Profile
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

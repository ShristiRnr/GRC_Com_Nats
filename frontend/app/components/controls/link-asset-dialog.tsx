"use client"

import { useState, useMemo, useEffect } from "react"
import { getAssets, linkAssetToControl, type Asset } from "~/lib/api/assets"
import { Button } from "~/components/ui/button"
import { Server, Plus, Loader2, Search, CheckCircle2 } from "lucide-react"
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

interface LinkAssetDialogProps {
    controlId: string
    orgId?: string
    onSuccess: () => void
}

export function LinkAssetDialog({ controlId, orgId, onSuccess }: LinkAssetDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [linking, setLinking] = useState(false)
    const [assets, setAssets] = useState<Asset[]>([])
    const [search, setSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const fetchAssets = async () => {
        setLoading(true)
        try {
            const data = await getAssets(orgId || "")
            setAssets(data)
        } catch (error) {
            toast.error("Failed to load assets")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchAssets()
            setSelectedIds([])
            setSearch("")
        }
    }, [open])

    const filteredAssets = useMemo(() => {
        return assets.filter(a =>
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.type.toLowerCase().includes(search.toLowerCase())
        )
    }, [assets, search])

    const handleLink = async () => {
        if (selectedIds.length === 0) return
        setLinking(true)
        try {
            await Promise.all(selectedIds.map(id => linkAssetToControl(id, controlId)))
            toast.success(`Linked ${selectedIds.length} assets successfully`)
            setOpen(false)
            onSuccess()
        } catch (error) {
            toast.error("Failed to link assets")
        } finally {
            setLinking(false)
        }
    }

    const toggleAsset = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="font-bold h-8 text-[11px] uppercase tracking-wider gap-2">
                    <Plus className="size-3.5" />
                    Link Assets
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-border bg-card shadow-2xl">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            <Server className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black tracking-tighter uppercase">Link Infrastructure</DialogTitle>
                            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                Select assets to protect with this control
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or type..."
                            className="pl-10 h-10 font-bold text-xs uppercase tracking-tight border-border/60 focus-visible:ring-primary/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <ScrollArea className="h-[300px] pr-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                                <Loader2 className="size-8 animate-spin text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Scanning Network...</span>
                            </div>
                        ) : filteredAssets.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No assets found matching search</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredAssets.map((asset) => (
                                    <div
                                        key={asset.id}
                                        className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer group ${selectedIds.includes(asset.id)
                                                ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                                                : 'border-border/40 bg-slate-50/50 hover:border-border hover:bg-white'
                                            }`}
                                        onClick={() => toggleAsset(asset.id)}
                                    >
                                        <Checkbox
                                            checked={selectedIds.includes(asset.id)}
                                            onCheckedChange={() => toggleAsset(asset.id)}
                                            className="rounded-md border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                                                    {asset.name}
                                                </span>
                                                <Badge variant="outline" className="text-[8px] font-black uppercase px-1 h-4 bg-white dark:bg-slate-900">
                                                    {asset.type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                                                <span>Criticality: {asset.criticality}</span>
                                                <span>•</span>
                                                <span>{asset.status}</span>
                                            </div>
                                        </div>
                                        {selectedIds.includes(asset.id) && (
                                            <CheckCircle2 className="size-4 text-primary animate-in zoom-in-50 duration-300" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-border flex items-center justify-between sm:justify-between">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {selectedIds.length} {selectedIds.length === 1 ? 'Asset' : 'Assets'} Selected
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="font-bold text-xs uppercase">Cancel</Button>
                        <Button
                            size="sm"
                            disabled={selectedIds.length === 0 || linking}
                            onClick={handleLink}
                            className="font-black text-xs uppercase tracking-widest px-6"
                        >
                            {linking ? (
                                <Loader2 className="size-4 animate-spin mr-2" />
                            ) : (
                                <Plus className="size-4 mr-2" />
                            )}
                            Link Now
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

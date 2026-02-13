"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Package, MoreVertical, Eye, Trash2, Shield, User, MapPin } from "lucide-react"
import type { Asset } from "~/lib/api/assets"
import { deleteAsset } from "~/lib/api/assets"
import { toast } from "sonner"

interface AssetTableProps {
    assets: Asset[]
    onSuccess: () => void
}

export function AssetTable({ assets, onSuccess }: AssetTableProps) {
    const handleDelete = async (id: string, name: string) => {
        try {
            await deleteAsset(id)
            toast.success("Asset deleted successfully", {
                description: `"${name}" has been removed from the registry.`
            })
            onSuccess()
        } catch (error) {
            toast.error("Failed to delete asset")
        }
    }

    const getCriticalityColor = (criticality: string) => {
        switch (criticality.toLowerCase()) {
            case 'critical': return "bg-rose-500 hover:bg-rose-600 text-white"
            case 'high': return "bg-orange-500 hover:bg-orange-600 text-white"
            case 'medium': return "bg-yellow-500 hover:bg-yellow-600 text-white"
            default: return "bg-emerald-500 hover:bg-emerald-600 text-white"
        }
    }

    if (assets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-card rounded-xl border border-dashed border-muted-foreground/20 text-center animate-in fade-in zoom-in duration-300">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Package className="size-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">No assets registered</h3>
                <p className="text-muted-foreground max-w-sm">
                    Start building your asset registry to track and protect organizational resources.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="font-bold text-foreground py-4">Asset Name</TableHead>
                        <TableHead className="font-bold text-foreground">Classification (CIA)</TableHead>
                        <TableHead className="font-bold text-foreground">Criticality</TableHead>
                        <TableHead className="font-bold text-foreground">Status</TableHead>
                        <TableHead className="font-bold text-foreground">Owner / Location</TableHead>
                        <TableHead className="text-right font-bold text-foreground pr-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assets.map((asset) => (
                        <TableRow key={asset.id} className="group border-border hover:bg-muted/20 transition-colors">
                            <TableCell className="py-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm border border-blue-100 dark:border-blue-900/30">
                                        <Package className="size-5" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-foreground text-sm uppercase tracking-tight">
                                            {asset.name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 uppercase">
                                            {asset.type || "Hardware"}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1.5">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-bold text-blue-600 uppercase">C</span>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 min-w-[20px] justify-center">{asset.confidentiality}</Badge>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-bold text-emerald-600 uppercase">I</span>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 min-w-[20px] justify-center">{asset.integrity}</Badge>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-bold text-orange-600 uppercase">A</span>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 min-w-[20px] justify-center">{asset.availability}</Badge>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className={`shadow-none px-3 py-0.5 text-[10px] font-bold border-none ${getCriticalityColor(asset.criticality)}`}>
                                    {asset.criticality}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={`capitalize shadow-none px-3 py-0.5 text-[10px] font-bold ${asset.status === 'active'
                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-none'
                                        : 'bg-muted text-muted-foreground hover:bg-muted border-border'
                                        }`}
                                >
                                    {asset.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-xs text-foreground font-bold">
                                        <User className="size-3 text-muted-foreground/60" />
                                        {asset.owner?.full_name || "Unassigned"}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                        <MapPin className="size-2.5" />
                                        {asset.location || "Remote/Cloud"}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right pr-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-muted/50 rounded-full">
                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[180px] p-1 shadow-xl border-border">
                                        <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/5">
                                            <Eye className="size-4 text-muted-foreground" />
                                            <span className="font-medium">Quick View</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/5">
                                            <Shield className="size-4 text-muted-foreground" />
                                            <span className="font-medium">Compliance Scan</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-border/50" />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-white focus:bg-destructive gap-2 cursor-pointer"
                                            onClick={() => handleDelete(asset.id, asset.name)}
                                        >
                                            <Trash2 className="size-4" />
                                            <span className="font-bold">Delete Asset</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

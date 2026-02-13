"use client"

import { useEffect, useState } from "react"
import { AssetTable } from "~/components/assets/asset-table"
import { AddAssetDialog } from "~/components/assets/add-asset-dialog"
import { getAssets, type Asset } from "~/lib/api/assets"
import { useNavigate, useSearchParams, useRouteLoaderData } from "react-router"
import { Package, ShieldAlert, Loader2, ArrowRight, Layers } from "lucide-react"

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const user = useRouteLoaderData("routes/protected") as { user: { org_id: string } } | null

    const fetchAssets = async () => {
        try {
            const data = await getAssets()
            setAssets(data)
        } catch (error) {
            console.error("Failed to fetch assets", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAssets()
    }, [])

    return (
        <div className="flex-1 space-y-10 p-4 md:p-10 bg-background/50 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-inner border border-blue-500/5">
                            <Layers className="size-6" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Asset Inventory</h1>
                            <p className="text-muted-foreground font-medium flex items-center gap-2">
                                Centralized registry for all organizational assets and infrastructure.
                                <ArrowRight className="size-3 opacity-50" />
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <AddAssetDialog orgId={user?.user?.org_id || "00000000-0000-0000-0000-000000000000"} onSuccess={fetchAssets} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 flex items-center justify-center">
                            <Package className="size-5" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Assets</span>
                    </div>
                    <div className="text-4xl font-black text-foreground tabular-nums">
                        {isLoading ? <Loader2 className="size-6 animate-spin" /> : assets.length}
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 flex items-center justify-center">
                            <ShieldAlert className="size-5" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Critical Assets</span>
                    </div>
                    <div className="text-4xl font-black text-foreground tabular-nums">
                        {isLoading ? <Loader2 className="size-6 animate-spin" /> : assets.filter(a => a.criticality === 'Critical').length}
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center">
                            <ShieldAlert className="size-5" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Asset Health</span>
                    </div>
                    <div className="text-4xl font-black text-foreground tabular-nums">
                        100%
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-card rounded-xl border border-border min-h-[400px]">
                    <Loader2 className="size-10 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground font-bold">Loading assets...</p>
                </div>
            ) : (
                <AssetTable assets={assets} onSuccess={fetchAssets} />
            )}
        </div>
    )
}

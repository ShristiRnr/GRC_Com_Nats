"use client"

import { useNavigate, useParams, Link } from "react-router"
import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, Home, Shield, ChevronRight } from "lucide-react"
import { Button } from "~/components/ui/button"
import { getControl, type Control } from "~/lib/api/controls"
import { ControlDetailView } from "~/components/controls/control-detail-view"

export default function ControlDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [control, setControl] = useState<Control | null>(null)
    const [loading, setLoading] = useState(true)

    async function loadControl() {
        if (!id) return
        setLoading(true)
        try {
            const data = await getControl(id)
            setControl(data)
        } catch (e) {
            console.error("Failed to load control", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadControl()
    }, [id])

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50/30 dark:bg-slate-950/20">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="size-10 animate-spin text-primary" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Retrieving Control Data...</p>
                </div>
            </div>
        )
    }

    if (!control) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-6 bg-slate-50/30 dark:bg-slate-950/20">
                <div className="p-4 bg-red-50 text-red-500 rounded-full">
                    <Shield className="size-12" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Access Denied or Not Found</h2>
                    <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto text-pretty">
                        The compliance control you are looking for might have been archived or moved.
                    </p>
                </div>
                <Button variant="outline" className="font-bold uppercase text-[11px] tracking-wider" onClick={() => navigate("/controls")}>
                    Back to Library
                </Button>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/20 antialiased font-medium">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground/80 mb-6 uppercase tracking-widest overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
                <Link to="/" className="flex items-center gap-1.5 hover:text-primary transition-colors hover:scale-105 active:scale-95">
                    <Home className="size-3.5" />
                    Home
                </Link>
                <ChevronRight className="size-3.5 opacity-40 shrink-0" />
                <Link to="/controls" className="flex items-center gap-1.5 hover:text-primary transition-colors hover:scale-105 active:scale-95">
                    <Shield className="size-3.5" />
                    Controls Library
                </Link>
                <ChevronRight className="size-3.5 opacity-40 shrink-0" />
                <span className="text-primary font-black drop-shadow-sm truncate max-w-[200px]">{control.code}</span>
            </nav>

            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/controls")}
                    className="h-10 w-10 rounded-full hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-border/60 transition-all hover:scale-110 active:scale-95"
                >
                    <ArrowLeft className="size-5" />
                </Button>
                <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Control Specification</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase transition-all duration-300">
                            {control.code}
                        </span>
                        <div className="h-4 w-px bg-border/60 hidden md:block" />
                        <span className="text-xl font-bold tracking-tight text-muted-foreground truncate max-w-[400px]">
                            {control.title}
                        </span>
                    </div>
                </div>
            </div>

            <ControlDetailView control={control} onRefresh={loadControl} />
        </div>
    )
}

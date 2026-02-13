"use client"

import { useState, useMemo } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"
import { Slider } from "~/components/ui/slider"
import { Badge } from "~/components/ui/badge"
import { createAsset } from "~/lib/api/assets"
import { toast } from "sonner"
import { Package, Plus, ShieldCheck, MapPin, Layers } from "lucide-react"

interface AddAssetDialogProps {
    children?: React.ReactNode
    onSuccess: () => void
    orgId: string
}

function computeRiskLevel(c: number, i: number, a: number): { level: 'Low' | 'Medium' | 'High' | 'Critical'; color: string } {
    const maxCIA = Math.max(c, i, a)
    if (maxCIA >= 5) return { level: 'Critical', color: 'bg-rose-500 hover:bg-rose-600 text-white border-none' }
    if (maxCIA >= 4) return { level: 'High', color: 'bg-orange-500 hover:bg-orange-600 text-white border-none' }
    if (maxCIA >= 3) return { level: 'Medium', color: 'bg-yellow-500 hover:bg-yellow-600 text-white border-none' }
    return { level: 'Low', color: 'bg-emerald-500 hover:bg-emerald-600 text-white border-none' }
}

export function AddAssetDialog({ children, onSuccess, orgId }: AddAssetDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "Hardware",
        status: "active",
        location: "",
        lifecycle_stage: "operation",
        confidentiality: 3,
        integrity: 3,
        availability: 3
    })

    const riskLevel = useMemo(
        () => computeRiskLevel(formData.confidentiality, formData.integrity, formData.availability),
        [formData.confidentiality, formData.integrity, formData.availability]
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await createAsset({
                ...formData,
                org_id: orgId,
                criticality: riskLevel.level
            } as any)
            toast.success("Asset registered successfully", {
                description: "The new asset has been added to the registry."
            })
            setOpen(false)
            onSuccess()
            setFormData({
                name: "",
                description: "",
                type: "Hardware",
                status: "active",
                location: "",
                lifecycle_stage: "operation",
                confidentiality: 3,
                integrity: 3,
                availability: 3
            })
        } catch (error) {
            toast.error("Failed to register asset")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95 gap-2">
                        <Plus className="size-4" />
                        Register Asset
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="bg-primary/5 p-6 border-b border-primary/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                <Package className="size-6" />
                            </div>
                            <DialogHeader className="p-0 text-left">
                                <DialogTitle className="text-xl font-bold text-foreground tracking-tight">Register New Asset</DialogTitle>
                                <DialogDescription className="text-xs font-medium text-muted-foreground/70">
                                    Catalog and classify organizational infrastructure.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>

                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Asset Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="E.g. Main Production Server"
                                        className="h-11 font-medium bg-muted/30 border-muted focus:bg-background transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Asset Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(v) => setFormData({ ...formData, type: v })}
                                    >
                                        <SelectTrigger className="h-11 font-medium bg-muted/30 border-muted">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Hardware">Hardware</SelectItem>
                                            <SelectItem value="Software">Software</SelectItem>
                                            <SelectItem value="Database">Database</SelectItem>
                                            <SelectItem value="Cloud">Cloud</SelectItem>
                                            <SelectItem value="Network">Network</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the asset and its purpose..."
                                    className="min-h-[80px] font-medium bg-muted/30 border-muted focus:bg-background transition-all resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2 border-t">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CIA Classification</Label>
                                <Badge className={`shadow-none px-3 py-0.5 text-[10px] font-bold border-none ${riskLevel.color}`}>
                                    {riskLevel.level} Risk
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-blue-600 uppercase">Confidentiality</span>
                                        <span className="text-xs font-bold text-foreground">{formData.confidentiality}</span>
                                    </div>
                                    <Slider
                                        value={[formData.confidentiality]}
                                        onValueChange={(v: number[]) => setFormData({ ...formData, confidentiality: v[0] })}
                                        min={1}
                                        max={5}
                                        step={1}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Integrity</span>
                                        <span className="text-xs font-bold text-foreground">{formData.integrity}</span>
                                    </div>
                                    <Slider
                                        value={[formData.integrity]}
                                        onValueChange={(v: number[]) => setFormData({ ...formData, integrity: v[0] })}
                                        min={1}
                                        max={5}
                                        step={1}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-orange-600 uppercase">Availability</span>
                                        <span className="text-xs font-bold text-foreground">{formData.availability}</span>
                                    </div>
                                    <Slider
                                        value={[formData.availability]}
                                        onValueChange={(v: number[]) => setFormData({ ...formData, availability: v[0] })}
                                        min={1}
                                        max={5}
                                        step={1}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2 border-t">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ownership & Location</Label>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <MapPin className="size-3" /> Location
                                    </Label>
                                    <Input
                                        id="location"
                                        placeholder="E.g. US-East-1 or Room 302"
                                        className="h-10 font-medium bg-muted/30 border-muted"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lifecycle" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Layers className="size-3" /> Lifecycle Stage
                                    </Label>
                                    <Select
                                        value={formData.lifecycle_stage}
                                        onValueChange={(v) => setFormData({ ...formData, lifecycle_stage: v })}
                                    >
                                        <SelectTrigger className="h-10 font-medium bg-muted/30 border-muted">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planning">Planning</SelectItem>
                                            <SelectItem value="acquisition">Acquisition</SelectItem>
                                            <SelectItem value="deployment">Deployment</SelectItem>
                                            <SelectItem value="operation">Operation</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="disposal">Disposal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-muted/30 border-t border-border mt-0 gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="font-bold hover:bg-background h-11"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="font-bold bg-primary hover:bg-primary/90 text-white min-w-[140px] h-11 shadow-lg shadow-primary/20"
                        >
                            {isLoading ? "Saving..." : "Register Asset"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import { useState } from "react"
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
import { createRisk } from "~/lib/api/risks"
import { toast } from "sonner"
import { AlertCircle, Plus, ShieldCheck } from "lucide-react"

interface AddRiskDialogProps {
    children?: React.ReactNode
    onSuccess: () => void
    orgId: string
}

export function AddRiskDialog({ children, onSuccess, orgId }: AddRiskDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        treatment_plan: "",
        inherent_impact: "3",
        inherent_likelihood: "3",
        status: "identified"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await createRisk({
                ...formData,
                org_id: orgId,
                inherent_impact: parseInt(formData.inherent_impact),
                inherent_likelihood: parseInt(formData.inherent_likelihood)
            } as any)
            toast.success("Risk identified successfully", {
                description: "The new risk has been added to the register."
            })
            setOpen(false)
            onSuccess()
            setFormData({
                title: "",
                description: "",
                treatment_plan: "",
                inherent_impact: "3",
                inherent_likelihood: "3",
                status: "identified"
            })
        } catch (error) {
            toast.error("Failed to identify risk")
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
                        Identify Risk
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="bg-primary/5 p-6 border-b border-primary/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                <AlertCircle className="size-6" />
                            </div>
                            <DialogHeader className="p-0">
                                <DialogTitle className="text-xl font-bold text-foreground tracking-tight">Identify New Risk</DialogTitle>
                                <DialogDescription className="text-xs font-medium text-muted-foreground/70">
                                    Record and assess potential organizational risks.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</Label>
                            <Input
                                id="title"
                                placeholder="E.g. Data breach in customer portal"
                                className="h-11 font-medium bg-muted/30 border-muted focus:bg-background transition-all"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the risk scenario and potential impact..."
                                className="min-h-[80px] font-medium bg-muted/30 border-muted focus:bg-background transition-all resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="treatment_plan" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Treatment Plan</Label>
                            <Textarea
                                id="treatment_plan"
                                placeholder="E.g. Implement MFA, regular backups..."
                                className="min-h-[80px] font-medium bg-muted/30 border-muted focus:bg-background transition-all resize-none"
                                value={formData.treatment_plan}
                                onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="impact" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Impact (1-5)</Label>
                                <Select
                                    value={formData.inherent_impact}
                                    onValueChange={(v) => setFormData({ ...formData, inherent_impact: v })}
                                >
                                    <SelectTrigger className="h-11 font-medium bg-muted/30 border-muted">
                                        <SelectValue placeholder="Impact" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 - Negligible</SelectItem>
                                        <SelectItem value="2">2 - Minor</SelectItem>
                                        <SelectItem value="3">3 - Moderate</SelectItem>
                                        <SelectItem value="4">4 - Major</SelectItem>
                                        <SelectItem value="5">5 - Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="likelihood" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Likelihood (1-5)</Label>
                                <Select
                                    value={formData.inherent_likelihood}
                                    onValueChange={(v) => setFormData({ ...formData, inherent_likelihood: v })}
                                >
                                    <SelectTrigger className="h-11 font-medium bg-muted/30 border-muted">
                                        <SelectValue placeholder="Likelihood" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 - Rare</SelectItem>
                                        <SelectItem value="2">2 - Unlikely</SelectItem>
                                        <SelectItem value="3">3 - Possible</SelectItem>
                                        <SelectItem value="4">4 - Likely</SelectItem>
                                        <SelectItem value="5">5 - Almost Certain</SelectItem>
                                    </SelectContent>
                                </Select>
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
                            {isLoading ? "Saving..." : "Identify Risk"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

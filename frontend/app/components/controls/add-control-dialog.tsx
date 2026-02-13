"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Plus, Loader2, ShieldCheck, Tag, Layers, FileText, Building2, CheckCircle2 } from "lucide-react"
import { createControl } from "~/lib/api/controls"
import { getFrameworks, type Framework } from "~/lib/api/frameworks"
import { getDepartments, type Department } from "~/lib/api/departments"
import { getCategories, createCategory, type Category } from "~/lib/api/categories"
import { getDomains, createDomain, type Domain } from "~/lib/api/domains"
import { toast } from "sonner"
import { cn } from "~/lib/utils"

interface AddControlDialogProps {
    onSuccess: () => void
}

export function AddControlDialog({ onSuccess }: AddControlDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Data states
    const [frameworks, setFrameworks] = useState<Framework[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [domains, setDomains] = useState<Domain[]>([])

    // Selection/New states
    const [selectedCategory, setSelectedCategory] = useState<string>("")
    const [selectedDomain, setSelectedDomain] = useState<string>("")
    const [newCategoryName, setNewCategoryName] = useState("")
    const [newDomainName, setNewDomainName] = useState("")
    const [showNewCategory, setShowNewCategory] = useState(false)
    const [showNewDomain, setShowNewDomain] = useState(false)
    const [creatingCategory, setCreatingCategory] = useState(false)
    const [creatingDomain, setCreatingDomain] = useState(false)

    useEffect(() => {
        if (open) {
            Promise.all([
                getFrameworks(),
                getDepartments(),
                getCategories(),
                getDomains()
            ]).then(([f, dept, cat, dom]) => {
                setFrameworks(f)
                setDepartments(dept)
                setCategories(cat)
                setDomains(dom)
            }).catch(err => {
                console.error("Failed to fetch form data", err)
                toast.error("Initialization error", { description: "Could not load all required options." })
            })
        }
    }, [open])

    async function handleCreateCategory() {
        if (!newCategoryName.trim()) return
        setCreatingCategory(true)
        try {
            const newCat = await createCategory(newCategoryName.trim())
            setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)))
            setSelectedCategory(newCat.name)
            setNewCategoryName("")
            setShowNewCategory(false)
            toast.success("Category created")
        } catch (error) {
            toast.error("Failed to create category")
        } finally {
            setCreatingCategory(false)
        }
    }

    async function handleCreateDomain() {
        if (!newDomainName.trim()) return
        setCreatingDomain(true)
        try {
            const newDom = await createDomain(newDomainName.trim())
            setDomains(prev => [...prev, newDom].sort((a, b) => a.name.localeCompare(b.name)))
            setSelectedDomain(newDom.id)
            setNewDomainName("")
            setShowNewDomain(false)
            toast.success("Domain created")
        } catch (error) {
            toast.error("Failed to create domain")
        } finally {
            setCreatingDomain(false)
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        const data = {
            code: formData.get("code") as string,
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            category: selectedCategory,
            domain_id: selectedDomain,
            framework_id: formData.get("framework_id") as string,
            department_id: formData.get("department_id") as string,
            status: "active",
        }

        try {
            await createControl(data)
            toast.success("Control created successfully", {
                description: `Control ${data.code} has been added to the library.`
            })
            setOpen(false)
            setSelectedCategory("")
            setSelectedDomain("")
            onSuccess()
        } catch (error) {
            toast.error("Failed to create control")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-sm font-bold text-white bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Plus className="h-4 w-4" />
                    Add Control
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] p-0 gap-0 overflow-hidden border-border bg-card shadow-2xl animate-in zoom-in-95 duration-300">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                                <ShieldCheck className="size-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-foreground tracking-tight">Add New Control</DialogTitle>
                                <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-70">
                                    Strategic Compliance Architecture
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50/10 dark:bg-black/5">
                        {/* Identity Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                                <Tag className="size-3.5" />
                                01. Identity
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                                        Code <span className="text-destructive">*</span>
                                    </Label>
                                    <Input id="code" name="code" placeholder="AC-1" required className="h-10 border-border/50 focus:border-primary/30 transition-all font-mono font-bold" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="title" className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                                        Title <span className="text-destructive">*</span>
                                    </Label>
                                    <Input id="title" name="title" placeholder="Access Control Policy" required className="h-10 border-border/50 focus:border-primary/30 transition-all font-bold" />
                                </div>
                            </div>
                        </div>

                        {/* Classification Section */}
                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                                <Layers className="size-3.5" />
                                02. Classification
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Category</Label>
                                    {!showNewCategory ? (
                                        <Select value={selectedCategory} onValueChange={(v) => v === "__new__" ? setShowNewCategory(true) : setSelectedCategory(v)}>
                                            <SelectTrigger className="h-10 border-border/50 font-bold">
                                                <SelectValue placeholder="Select category..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={c.name} className="font-medium">{c.name}</SelectItem>
                                                ))}
                                                <SelectItem value="__new__" className="text-primary font-bold bg-primary/5 hover:bg-primary/10">
                                                    <span className="flex items-center gap-2">
                                                        <Plus className="size-3" />
                                                        Create New...
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                                            <Input
                                                placeholder="New category..."
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                className="h-10 font-bold"
                                                autoFocus
                                            />
                                            <Button type="button" size="sm" className="h-10 px-3" onClick={handleCreateCategory} disabled={creatingCategory}>
                                                {creatingCategory ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                                            </Button>
                                            <Button type="button" size="sm" variant="ghost" className="h-10 px-3 text-muted-foreground" onClick={() => { setShowNewCategory(false); setNewCategoryName("") }}>
                                                ✕
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Domain / Area</Label>
                                    {!showNewDomain ? (
                                        <Select value={selectedDomain} onValueChange={(v) => v === "__new__" ? setShowNewDomain(true) : setSelectedDomain(v)}>
                                            <SelectTrigger className="h-10 border-border/50 font-bold">
                                                <SelectValue placeholder="Select domain..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {domains.map((d) => (
                                                    <SelectItem key={d.id} value={d.id} className="font-medium">{d.name}</SelectItem>
                                                ))}
                                                <SelectItem value="__new__" className="text-primary font-bold bg-primary/5 hover:bg-primary/10">
                                                    <span className="flex items-center gap-2">
                                                        <Plus className="size-3" />
                                                        Create New...
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex gap-2 animate-in slide-in-from-right-2 duration-300">
                                            <Input
                                                placeholder="New domain..."
                                                value={newDomainName}
                                                onChange={(e) => setNewDomainName(e.target.value)}
                                                className="h-10 font-bold"
                                                autoFocus
                                            />
                                            <Button type="button" size="sm" className="h-10 px-3" onClick={handleCreateDomain} disabled={creatingDomain}>
                                                {creatingDomain ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                                            </Button>
                                            <Button type="button" size="sm" variant="ghost" className="h-10 px-3 text-muted-foreground" onClick={() => { setShowNewDomain(false); setNewDomainName("") }}>
                                                ✕
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Ownership Section */}
                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                                <Building2 className="size-3.5" />
                                03. Ownership
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department_id" className="text-xs font-black text-muted-foreground uppercase tracking-wider">Responsible Department</Label>
                                    <Select name="department_id">
                                        <SelectTrigger className="h-10 border-border/50 font-bold">
                                            <SelectValue placeholder="Select department..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="framework_id" className="text-xs font-black text-muted-foreground uppercase tracking-wider">Primary Framework <span className="text-destructive">*</span></Label>
                                    <Select name="framework_id" required>
                                        <SelectTrigger className="h-10 border-border/50 font-bold">
                                            <SelectValue placeholder="Select framework..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {frameworks.map((fw) => (
                                                <SelectItem key={fw.id} value={fw.id}>{fw.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                                <FileText className="size-3.5" />
                                04. Tactical Details
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-black text-muted-foreground uppercase tracking-wider">Control Description / Guidance</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe the control requirements and implementation guidance..."
                                    className="min-h-[100px] resize-none text-sm font-medium border-border/50 focus:border-primary/30 shadow-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground italic uppercase tracking-wider">
                            <CheckCircle2 className="size-3 text-emerald-500" />
                            Fields with * are mandatory
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={loading} className="font-bold border-border/60 hover:bg-white transition-all">
                                Cancel
                            </Button>
                            <Button type="submit" size="sm" disabled={loading} className="min-w-[130px] font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:translate-y-[-1px] active:translate-y-[0px]">
                                {loading ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin mr-2" />
                                        Constructing...
                                    </>
                                ) : (
                                    "Build Control"
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

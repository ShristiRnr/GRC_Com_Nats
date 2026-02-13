"use client"

import { useState, useRef } from "react"
import { Button } from "~/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"
import { addEvidence } from "~/lib/api/control-evidence"
import { toast } from "sonner"
import { Loader2, Plus, Upload, Link as LinkIcon, FileText, X, ShieldCheck } from "lucide-react"
import { cn } from "~/lib/utils"

interface AddEvidenceDialogProps {
    controlId: string
    onSuccess: () => void
}

export function AddEvidenceDialog({ controlId, onSuccess }: AddEvidenceDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState<'file' | 'url' | 'attestation'>('file')
    const [file, setFile] = useState<File | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }

    const removeFile = () => {
        setFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            formData.append('controlId', controlId)
            formData.append('type', type)

            if (type === 'file' && file) {
                formData.append('file', file)
            } else if (type === 'file' && !file) {
                toast.error('Please select a file')
                setLoading(false)
                return
            }

            await addEvidence(formData)
            toast.success("Evidence secured successfully")
            setOpen(false)
            setFile(null)
            onSuccess()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add evidence")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="font-bold h-8 text-[11px] uppercase tracking-wider gap-2">
                    <Plus className="size-3.5" />
                    Secure Evidence
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-border bg-card shadow-2xl">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black tracking-tighter uppercase">Artifact Deposition</DialogTitle>
                            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                Collect and verify control implementation evidence
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Evidence Title</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g., Firewall Configuration Logs Q1"
                            required
                            className="font-bold text-xs uppercase tracking-tight border-border/60 focus-visible:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Deposition Type</Label>
                        <Select
                            value={type}
                            onValueChange={(val: 'file' | 'url' | 'attestation') => setType(val)}
                        >
                            <SelectTrigger className="font-bold text-xs uppercase tracking-tight border-border/60">
                                <SelectValue placeholder="Select evidence type" />
                            </SelectTrigger>
                            <SelectContent className="z-[101]">
                                <SelectItem value="file" className="font-bold text-xs uppercase cursor-pointer">
                                    <div className="flex items-center">
                                        <Upload className="h-4 w-4 mr-2 text-primary" /> Physical File
                                    </div>
                                </SelectItem>
                                <SelectItem value="url" className="font-bold text-xs uppercase cursor-pointer">
                                    <div className="flex items-center">
                                        <LinkIcon className="h-4 w-4 mr-2 text-primary" /> External Link
                                    </div>
                                </SelectItem>
                                <SelectItem value="attestation" className="font-bold text-xs uppercase cursor-pointer">
                                    <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-primary" /> Attestation Statement
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {type === 'file' && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payload Upload</Label>
                            <div
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all bg-slate-50/50",
                                    dragActive ? "border-primary bg-primary/5 scale-[0.98]" : "border-border/60 hover:border-primary/40 hover:bg-white",
                                    loading && "opacity-50 pointer-events-none"
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {file ? (
                                    <div className="flex items-center gap-3 p-3 bg-white border border-primary/20 rounded-lg shadow-sm animate-in fade-in zoom-in-95">
                                        <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                            <FileText className="size-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{file.name}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">{(file.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-full hover:bg-rose-50 hover:text-rose-500"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                removeFile()
                                            }}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-4">
                                        <div className="size-10 rounded-full bg-white flex items-center justify-center border border-border/60 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload className={cn("size-5 text-muted-foreground transition-colors", dragActive && "text-primary")} />
                                        </div>
                                        <p className="text-xs text-slate-900 font-black uppercase tracking-tight">
                                            Click to capture or drag-set
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-tighter">
                                            SVG, PNG, JPG, PDF, or JSON (max 10MB)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {type === 'url' && (
                        <div className="space-y-2">
                            <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Digital Location</Label>
                            <Input
                                id="url"
                                name="url"
                                type="url"
                                placeholder="https://compliance-ev.acme.com/..."
                                required
                                className="font-bold text-xs border-border/60 focus-visible:ring-primary/20"
                            />
                        </div>
                    )}

                    {type === 'attestation' && (
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Narrative Evidence</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="State the implementation details or witness testimony..."
                                required
                                className="min-h-[100px] font-medium text-xs border-border/60 focus-visible:ring-primary/20"
                            />
                        </div>
                    )}

                    <DialogFooter className="pt-4 flex items-center justify-end gap-3">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} className="font-bold text-xs uppercase">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={loading || (type === 'file' && !file)}
                            className="font-black text-xs uppercase tracking-widest px-8 shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Secure Deposition
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

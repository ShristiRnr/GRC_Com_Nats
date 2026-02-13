"use client"

import { useState } from "react"
import { useNavigate } from "react-router"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { updateTaskStatus } from "~/lib/api/tasks"
import type { Task } from "~/lib/api/tasks"
import { toast } from "sonner"
import { cn } from "~/lib/utils"
import { Loader2, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Undo2 } from "lucide-react"

interface TaskActionDialogProps {
    task: Task
    action: string
    onClose: () => void
    onSuccess: () => void
}

export function TaskActionDialog({ task, action, onClose, onSuccess }: TaskActionDialogProps) {
    const navigate = useNavigate()
    const [notes, setNotes] = useState("")
    const [result, setResult] = useState<string>("compliant")
    const [isLoading, setIsLoading] = useState(false)

    const getTitle = () => {
        switch (action) {
            case 'submit': return 'Submit for Review'
            case 'approve': return 'Approve Evidence'
            case 'refer_back': return 'Return to Owner'
            case 'assess': return 'Final Assessment'
            default: return 'Workflow Action'
        }
    }

    const getDescription = () => {
        switch (action) {
            case 'submit': return 'Adding notes helps the reviewer understand the evidence provided.'
            case 'approve': return 'Confirming that the evidence meets the control requirements.'
            case 'refer_back': return 'Provide clear feedback on what needs to be improved.'
            case 'assess': return 'Determination of the absolute compliance status for this control.'
            default: return 'Perform a workflow action on this task.'
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            let targetStatus = ""
            let updates: any = { notes }

            switch (action) {
                case 'submit':
                    targetStatus = "submitted"
                    break
                case 'approve':
                    targetStatus = "approved"
                    updates.reviewer_notes = notes
                    break
                case 'refer_back':
                    if (!notes.trim()) {
                        toast.error("Feedback is required when returning a task.")
                        setIsLoading(false)
                        return
                    }
                    targetStatus = "refer_back"
                    updates.reviewer_notes = notes
                    break
                case 'assess':
                    targetStatus = "completed"
                    updates.result = result
                    updates.assessor_notes = notes
                    break
            }

            await updateTaskStatus(task.id, {
                status: targetStatus,
                ...updates
            })

            toast.success(`Task successfully ${action === 'refer_back' ? 'returned' : action + 'ed'}`)
            onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(error.message || "Action failed")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-xl">
                <DialogHeader>
                    <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-inner border border-primary/5">
                        {action === 'approve' && <CheckCircle className="size-6" />}
                        {action === 'refer_back' && <Undo2 className="size-6 text-rose-500" />}
                        {action === 'assess' && <ShieldCheck className="size-6 text-violet-500" />}
                        {action === 'submit' && <CheckCircle className="size-6 text-emerald-500" />}
                    </div>
                    <DialogTitle className="text-2xl font-black">{getTitle()}</DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground">
                        {getDescription()}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Task Info */}
                    <div className="rounded-2xl bg-muted/50 p-4 border border-border/50 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Active Control</p>
                        <p className="text-sm font-black text-foreground">{task.control?.title || task.title}</p>
                    </div>

                    {/* Assessment Options */}
                    {action === 'assess' && (
                        <div className="space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Compliance Status</Label>
                            <RadioGroup value={result} onValueChange={setResult} className="grid grid-cols-1 gap-3">
                                <div className={cn(
                                    "flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer hover:bg-muted/50",
                                    result === 'compliant' ? "border-emerald-500 bg-emerald-500/5" : "border-border/50"
                                )}>
                                    <RadioGroupItem value="compliant" id="compliant" className="sr-only" />
                                    <Label htmlFor="compliant" className="flex items-center gap-3 cursor-pointer flex-1 font-bold">
                                        <div className={cn("size-5 rounded-full border-2 flex items-center justify-center transition-colors", result === 'compliant' ? "border-emerald-500" : "border-muted-foreground/30")}>
                                            {result === 'compliant' && <div className="size-2.5 rounded-full bg-emerald-500" />}
                                        </div>
                                        <CheckCircle className="size-4 text-emerald-500" />
                                        Compliant
                                    </Label>
                                </div>
                                <div className={cn(
                                    "flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer hover:bg-muted/50",
                                    result === 'non_compliant' ? "border-rose-500 bg-rose-500/5" : "border-border/50"
                                )}>
                                    <RadioGroupItem value="non_compliant" id="non_compliant" className="sr-only" />
                                    <Label htmlFor="non_compliant" className="flex items-center gap-3 cursor-pointer flex-1 font-bold">
                                        <div className={cn("size-5 rounded-full border-2 flex items-center justify-center transition-colors", result === 'non_compliant' ? "border-rose-500" : "border-muted-foreground/30")}>
                                            {result === 'non_compliant' && <div className="size-2.5 rounded-full bg-rose-500" />}
                                        </div>
                                        <XCircle className="size-4 text-rose-500" />
                                        Non-Compliant
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                            {action === 'refer_back' ? 'Feedback Notes (Required)' : 'Workflow Notes'}
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder={action === 'refer_back' ? "Describe the required changes..." : "Any additional context..."}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="rounded-xl border-border/50 bg-background/50 focus:ring-primary min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
                        Discard
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={cn(
                            "rounded-xl font-black uppercase tracking-widest text-[10px] px-8",
                            action === 'refer_back' ? "bg-rose-600 hover:bg-rose-700" :
                                action === 'assess' ? "bg-violet-600 hover:bg-violet-700" : ""
                        )}
                    >
                        {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        {action === 'submit' && 'Confirm Submission'}
                        {action === 'approve' && 'Approve & Forward'}
                        {action === 'refer_back' && 'Return to Owner'}
                        {action === 'assess' && 'Publish Assessment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog"
import { EvidenceUpload } from "./evidence-upload"
import { FileCheck } from "lucide-react"

interface EvidenceDialogProps {
    taskId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EvidenceDialog({ taskId, open, onOpenChange, onSuccess }: EvidenceDialogProps) {
    if (!taskId) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-primary/5 p-6 border-b border-primary/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                            <FileCheck className="size-6" />
                        </div>
                        <DialogHeader className="p-0 text-left">
                            <DialogTitle className="text-xl font-bold text-foreground tracking-tight">Submit Evidence</DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground/70">
                                Upload proof of compliance for this task.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                <div className="p-6">
                    <EvidenceUpload
                        taskId={taskId}
                        onUploadComplete={() => {
                            if (onSuccess) onSuccess()
                            onOpenChange(false)
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

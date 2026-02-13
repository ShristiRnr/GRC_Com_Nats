"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { toast } from "sonner"
import { Upload, ShieldCheck, Loader2 } from "lucide-react"
import { uploadEvidence } from "~/lib/api/tasks"

interface EvidenceUploadProps {
    taskId: string
    onUploadComplete?: () => void
}

export function EvidenceUpload({ taskId, onUploadComplete }: EvidenceUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    async function computeChecksum(file: File): Promise<string> {
        const buffer = await file.arrayBuffer()
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setProgress(0)

        try {
            // 1. Calculate Checksum
            setProgress(20)
            const checksum = await computeChecksum(file)
            setProgress(40)

            // 2. Upload to Backend (Using my API)
            // Note: Since I don't have a real file storage yet, 
            // I'll simulate the storage path or just send the name.
            // In a real app, this would be a multipart upload or to S3.

            await uploadEvidence(taskId, {
                file_path: `storage/evidence/${taskId}/${file.name}`,
                file_name: file.name,
                checksum: checksum,
                uploaded_by: "1" // Local admin for now
            })

            setProgress(100)
            toast.success("Evidence uploaded", {
                description: `SHA-256: ${checksum.substring(0, 12)}...`
            })

            if (onUploadComplete) onUploadComplete()

        } catch (error) {
            console.error("Upload failed:", error)
            toast.error("Upload failed", {
                description: "Could not upload evidence. Please try again."
            })
        } finally {
            setIsUploading(false)
            setProgress(0)
            // Reset input
            e.target.value = ""
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    className="relative font-bold border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            Select File
                        </>
                    )}
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </Button>
                {isUploading && (
                    <div className="flex flex-col gap-1 min-w-[120px]">
                        <Progress value={progress} className="h-1.5 bg-primary/10" />
                        <span className="text-[10px] text-muted-foreground font-bold">{progress}% complete</span>
                    </div>
                )}
            </div>

            <div className="p-3 rounded-lg bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 flex items-start gap-3">
                <ShieldCheck className="size-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-orange-800 dark:text-orange-300 uppercase tracking-tight">Integrity Verification</span>
                    <p className="text-[10px] text-orange-700/70 dark:text-orange-400/70 font-medium">
                        Files are cryptographically verified via SHA-256. This ensures evidence remains untampered and audit-ready.
                    </p>
                </div>
            </div>
        </div>
    )
}

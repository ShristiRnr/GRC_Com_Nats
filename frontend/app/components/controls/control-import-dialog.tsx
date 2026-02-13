'use client'

import { useState, useRef } from 'react'
import { Button } from '~/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Upload, FileUp, AlertCircle, CheckCircle, Download, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface ImportStats {
    processed: number
    failed: number
    warnings?: string[]
    errors: string[]
}

interface ControlImportDialogProps {
    onSuccess?: () => void
}

export function ControlImportDialog({ onSuccess }: ControlImportDialogProps) {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [stats, setStats] = useState<ImportStats | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setStats(null)
        }
    }

    async function handleUpload() {
        if (!file) return

        setIsUploading(true)
        setStats(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/controls/import', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.error || 'Import failed')
            }

            const result: ImportStats = await response.json()
            setStats(result)

            if (result.processed > 0) {
                toast.success(`Successfully processed ${result.processed} controls`)
                if (result.warnings && result.warnings.length > 0) {
                    toast.warning(`${result.warnings.length} warnings encountered`)
                }
                if (result.failed === 0) {
                    setTimeout(() => {
                        setOpen(false)
                        onSuccess?.()
                    }, 2000)
                } else {
                    onSuccess?.()
                }
            } else if (result.failed > 0) {
                toast.error(`Import failed: ${result.failed} errors`)
            }
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : 'Failed to upload')
        } finally {
            setIsUploading(false)
        }
    }

    function downloadTemplate() {
        const headers = ['code', 'title', 'description', 'category', 'frameworks']
        const rows = [
            ['AC-1', 'Access Control Policy', 'Description of policy...', 'Access Control', 'SOC 2, ISO 27001'],
            ['AC-2', 'Account Management', 'Manage system accounts...', 'Access Control', 'SOC 2']
        ]
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'controls-template.csv'
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="size-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Import Controls</DialogTitle>
                    <DialogDescription className="flex items-center justify-between">
                        <span>Upload a CSV file with columns: code, title, description, category, frameworks.</span>
                        <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2 h-7">
                            <Download className="size-3" />
                            Template
                        </Button>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="csv-file">CSV File</Label>
                        <Input
                            id="csv-file"
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>

                    {stats && (
                        <div className={`space-y-2 p-4 rounded-lg border ${stats.processed > 0 ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                            <div className="flex items-center gap-2 font-medium">
                                {stats.processed > 0 ? <CheckCircle className="size-4" /> : <AlertCircle className="size-4" />}
                                <span>Import Results</span>
                            </div>
                            <div className="text-sm space-y-1">
                                <p>Processed: {stats.processed}</p>
                                <p>Failed: {stats.failed}</p>
                            </div>

                            {stats.warnings && stats.warnings.length > 0 && (
                                <div className="mt-2 text-sm max-h-[80px] overflow-y-auto border-t border-amber-300 pt-2 text-amber-700">
                                    <p className="font-semibold mb-1 flex items-center gap-1">
                                        <AlertTriangle className="size-3" /> Warnings:
                                    </p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {stats.warnings.map((warn, i) => (
                                            <li key={i}>{warn}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {stats.errors && stats.errors.length > 0 && (
                                <div className="mt-2 text-sm max-h-[100px] overflow-y-auto border-t border-black/10 pt-2">
                                    <p className="font-semibold mb-1">Errors:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {stats.errors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? (
                            <>
                                <FileUp className="mr-2 size-4 animate-bounce" />
                                Importing...
                            </>
                        ) : (
                            'Import'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

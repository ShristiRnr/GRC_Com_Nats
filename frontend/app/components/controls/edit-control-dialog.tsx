import { useState, useEffect } from "react"
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
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { updateControl, type Control } from "~/lib/api/controls"
import { Loader2, Pencil } from "lucide-react"

interface EditControlDialogProps {
    control: Control
    onSuccess?: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function EditControlDialog({ control, onSuccess, open, onOpenChange }: EditControlDialogProps) {
    const [isOpen, setIsOpen] = useState(open ?? false)
    const [isLoading, setIsLoading] = useState(false)
    const [code, setCode] = useState(control.code)
    const [title, setTitle] = useState(control.title)
    const [description, setDescription] = useState(control.description || "")
    const [category, setCategory] = useState(control.category || "")
    const [error, setError] = useState<string | null>(null)

    // Sync external open state if controlled
    useEffect(() => {
        if (open !== undefined) {
            setIsOpen(open)
        }
    }, [open])

    // Reset form when control changes cleanly
    useEffect(() => {
        if (isOpen) {
            setCode(control.code)
            setTitle(control.title)
            setDescription(control.description || "")
            setCategory(control.category || "")
            setError(null)
        }
    }, [isOpen, control])

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen)
        onOpenChange?.(newOpen)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            await updateControl(control.id, {
                code,
                title,
                description,
                category
            })

            handleOpenChange(false)
            onSuccess?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update control")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {!originalControlTrigger ? (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Pencil className="size-4" />
                        Edit Control
                    </Button>
                ) : null}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Control</DialogTitle>
                    <DialogDescription>
                        Update the details of the control.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Control Code</Label>
                            <Input
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="e.g. AC-1"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="Access Control"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Control Title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detailed description of the control requirements..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// Helper to allow usage without trigger if controlled externally
const originalControlTrigger = false;

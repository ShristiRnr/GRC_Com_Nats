"use client"

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
import { Plus, Loader2 } from "lucide-react"
import { createPolicy } from "~/lib/api/policies"
import { useState } from "react"
import { toast } from "sonner"

interface AddPolicyDialogProps {
    onSuccess?: () => void;
}

export function AddPolicyDialog({ onSuccess }: AddPolicyDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const title = formData.get('title') as string
        const content = formData.get('content') as string

        try {
            await createPolicy({ title, content })
            setOpen(false)
            toast.success("Policy created", {
                description: "The policy draft has been created.",
            })
            if (onSuccess) onSuccess()
        } catch (error) {
            toast.error("Error", {
                description: "Failed to create policy. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Policy
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Policy</DialogTitle>
                        <DialogDescription>
                            Draft a new internal policy document.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Data Retention Policy"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="content" className="text-right">
                                Abstract
                            </Label>
                            <Textarea
                                id="content"
                                name="content"
                                placeholder="Policy summary and key objectives..."
                                className="col-span-3 h-32"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Draft
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

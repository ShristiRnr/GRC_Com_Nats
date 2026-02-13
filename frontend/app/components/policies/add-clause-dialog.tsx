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
import { createPolicyClause } from "~/lib/api/policies"
import { useState } from "react"
import { toast } from "sonner"

interface AddClauseDialogProps {
    policyId: string;
    onSuccess?: () => void;
}

export function AddClauseDialog({ policyId, onSuccess }: AddClauseDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const clause_id = formData.get('clause_id') as string
        const content = formData.get('content') as string
        const control_id = formData.get('control_id') as string || ""

        try {
            await createPolicyClause(policyId, { clause_id, content, control_id })
            setOpen(false)
            toast.success("Clause added", {
                description: "The clause has been added to the policy.",
            })
            if (onSuccess) onSuccess()
        } catch (error) {
            toast.error("Error", {
                description: "Failed to add clause. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Clause
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Policy Clause</DialogTitle>
                        <DialogDescription>
                            Define a new requirement or provision for this policy.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="clause_id" className="text-right">
                                Clause ID
                            </Label>
                            <Input
                                id="clause_id"
                                name="clause_id"
                                placeholder="e.g., 3.1.1"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="content" className="text-right">
                                Content
                            </Label>
                            <Textarea
                                id="content"
                                name="content"
                                placeholder="Clause requirement description..."
                                className="col-span-3 h-24"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="control_id" className="text-right">
                                Control ID
                            </Label>
                            <Input
                                id="control_id"
                                name="control_id"
                                placeholder="Optional: linked control UUID"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Clause
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

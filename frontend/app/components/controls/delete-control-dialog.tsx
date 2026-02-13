"use client"

import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteControl } from "~/lib/api/controls"
import { toast } from "sonner"

interface DeleteControlDialogProps {
    controlId: string
    controlCode: string
    onSuccess: () => void
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function DeleteControlDialog({
    controlId,
    controlCode,
    onSuccess,
    trigger,
    open: externalOpen,
    onOpenChange: setExternalOpen
}: DeleteControlDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [internalOpen, setInternalOpen] = useState(false)

    const open = externalOpen !== undefined ? externalOpen : internalOpen
    const setOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen

    async function handleDelete() {
        setIsDeleting(true)
        try {
            await deleteControl(controlId)
            toast.success("Control deleted successfully", {
                description: `Control ${controlCode} has been removed from the library.`
            })
            onSuccess()
            setOpen(false)
        } catch (error) {
            toast.error("Failed to delete control", {
                description: "There was an error while trying to delete the control. Please try again."
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the control <span className="font-semibold text-foreground">{controlCode}</span>.
                        This action cannot be undone and may affect compliance tracking.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Control"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

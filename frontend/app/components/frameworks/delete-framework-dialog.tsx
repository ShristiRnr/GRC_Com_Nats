'use client'

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
import { Trash2 } from "lucide-react"
import { deleteFramework } from "~/lib/api/frameworks"
import { toast } from "sonner"
import { useState } from "react"
import type { Framework } from "~/lib/api/frameworks"
import { useNavigate } from "react-router"

interface DeleteFrameworkDialogProps {
    framework: Framework
}

export function DeleteFrameworkDialog({ framework }: DeleteFrameworkDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleDelete() {
        setLoading(true)
        try {
            const result: any = await deleteFramework(framework.id)
            setOpen(false)

            if (result.action === 'archived') {
                toast.warning("Framework Archived", {
                    description: `This framework is used by ${result.count} active programs, so it stays as "Archived".`,
                    duration: 5000,
                })
            } else {
                toast.success("Framework Deleted", {
                    description: "The framework has been permanently removed.",
                })
            }
            navigate(0)
        } catch (error: any) {
            toast.error("Deletion Failed", {
                description: error.message || "Failed to delete framework.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 px-2 lg:px-3 bg-red-50 text-destructive hover:bg-red-100 hover:text-destructive border border-red-200 shadow-none"
                // Fix class compatibility with Tailwind v4 if needed, but keeping original classes
                >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        <span className="font-semibold text-foreground"> {framework.name} </span>
                        framework and all mapped controls.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault() // Prevent closing
                            handleDelete()
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

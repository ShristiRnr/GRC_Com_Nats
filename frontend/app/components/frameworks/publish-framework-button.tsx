'use client'

import { Button } from "~/components/ui/button"
import { Send } from "lucide-react"
import { updateFrameworkStatus } from "~/lib/api/frameworks"
import { toast } from "sonner"
import type { Framework } from "~/lib/api/frameworks"
import { useState } from "react"
import { useNavigate } from "react-router"

export function PublishFrameworkButton({ framework }: { framework: Framework }) {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    if (framework.status === 'published') return null

    async function handlePublish() {
        setLoading(true)
        try {
            await updateFrameworkStatus(framework.id, 'published')
            toast.success("Framework published")
            navigate(0)
        } catch (e) {
            toast.error("Failed to publish framework")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handlePublish}
            disabled={loading}
            className="h-8 px-2 lg:px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
        >
            <Send className="mr-2 h-3.5 w-3.5" />
            Publish
        </Button>
    )
}

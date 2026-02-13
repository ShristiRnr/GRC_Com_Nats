"use client"

import { useEffect, useState } from "react"
import { TaskInbox } from "~/components/tasks/task-inbox"
import { getTasks } from "~/lib/api/tasks"
import type { Task } from "~/lib/api/tasks"
import { useNavigate, useSearchParams, useRouteLoaderData } from "react-router"
import { Target, ArrowRight, Loader2 } from "lucide-react"

export default function TasksPage() {
    const [searchParams] = useSearchParams()
    const user = useRouteLoaderData("routes/protected") as { user: { id: string; org_id: string } } | null
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [allTasks, setAllTasks] = useState<Task[]>([])

    // Derived state from URL
    const tab = searchParams.get('tab') || 'owner'
    const status = searchParams.get('status') || undefined

    const fetchTasks = async () => {
        try {
            const orgId = user?.user?.org_id || "00000000-0000-0000-0000-000000000000"
            const data = await getTasks(orgId)
            const safeData = data || []
            setAllTasks(safeData)
            setTasks(safeData)
        } catch (error) {
            console.error("Failed to fetch tasks", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, []) // Dependencies intentionally empty to fetch once on mount

    // Mock counts based on allTasks (simplified for v2 parity)
    const tabCounts = {
        owner: (allTasks || []).length,
        reviewer: 0,
        assessor: 0
    }

    // Authenticated user ID
    const currentUserId = user?.user?.id?.toString() || "unknown"

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
                    <Loader2 className="size-10 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground font-medium text-sm">Loading tasks...</p>
                </div>
            ) : (
                <TaskInbox
                    tasks={tasks} // This should ideally be filtered by role based on `tab`
                    allTasks={allTasks}
                    activeTab={tab}
                    tabCounts={tabCounts}
                    currentUserId={currentUserId}
                    onSuccess={fetchTasks}
                />
            )}
        </div>
    )
}

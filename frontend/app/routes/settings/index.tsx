import { useEffect, useState } from 'react'
import { getRoles, getUsers, getDepartments, type Role, type User, type Department } from '~/lib/api/settings'
import { SettingsView } from '~/components/settings/settings-view'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
    const [roles, setRoles] = useState<Role[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [rolesData, usersData, deptsData] = await Promise.all([
                    getRoles(),
                    getUsers(),
                    getDepartments()
                ])
                setRoles(rolesData)
                setUsers(usersData)
                setDepartments(deptsData)
            } catch (error) {
                console.error("Failed to load settings data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <SettingsView roles={roles} users={users} departments={departments} />
    )
}

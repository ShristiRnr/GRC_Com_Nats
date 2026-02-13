import { create } from 'zustand'
import type { PermissionCode } from '../auth/permissions'

// Mock types since we removed Supabase
interface User {
    id: string
    email?: string
    user_metadata?: {
        full_name?: string
        avatar_url?: string
    }
}

interface Profile {
    id: string
    email: string
    full_name: string | null
    role_id: string | null
    role_name: string | null
    org_id: string | null
}

interface AuthState {
    user: User | null
    profile: Profile | null
    permissions: string[]
    isLoading: boolean
    setUser: (user: User | null) => void
    setProfile: (profile: Profile | null) => void
    setPermissions: (permissions: string[]) => void
    setIsLoading: (isLoading: boolean) => void
    hasPermission: (permission: PermissionCode | string) => boolean
    hasAnyPermission: (permissions: (PermissionCode | string)[]) => boolean
    hasAllPermissions: (permissions: (PermissionCode | string)[]) => boolean
    isAdmin: () => boolean
    reset: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: {
        id: 'mock-user-1',
        email: 'admin@example.com',
        user_metadata: {
            full_name: 'Admin User',
            avatar_url: ''
        }
    }, // Default mock user
    profile: {
        id: 'mock-user-1',
        email: 'admin@example.com',
        full_name: 'Admin User',
        role_id: 'admin',
        role_name: 'Administrator',
        org_id: 'org-1'
    },
    permissions: ['admin.users', 'admin.roles', 'admin.settings'], // Give admin permissions by default for now
    isLoading: false,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setPermissions: (permissions) => set({ permissions }),
    setIsLoading: (isLoading) => set({ isLoading }),

    hasPermission: (permission) => {
        const { permissions } = get()
        return permissions.includes(permission)
    },

    hasAnyPermission: (perms) => {
        const { permissions } = get()
        return perms.some(p => permissions.includes(p))
    },

    hasAllPermissions: (perms) => {
        const { permissions } = get()
        return perms.every(p => permissions.includes(p))
    },

    isAdmin: () => {
        const { permissions } = get()
        return permissions.includes('admin.users') && permissions.includes('admin.roles')
    },

    reset: () => set({ user: null, profile: null, permissions: [], isLoading: false })
}))

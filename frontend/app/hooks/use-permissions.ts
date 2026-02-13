'use client'

import { useAuthStore } from '../lib/store/auth-store'
import { Permissions, type PermissionCode } from '../lib/auth/permissions'

// Re-export Permissions for convenience
export { Permissions }

/**
 * Hook to check user permissions in client components.
 */
export function usePermissions() {
    const {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isAdmin,
        profile
    } = useAuthStore()

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isAdmin: isAdmin(),
        roleName: profile?.role_name || null,
        userId: profile?.id || null
    }
}

/**
 * Hook to get current user profile.
 */
export function useCurrentUser() {
    const { profile, user, isLoading } = useAuthStore()

    return {
        user,
        profile,
        isLoading,
        isAuthenticated: !!user
    }
}

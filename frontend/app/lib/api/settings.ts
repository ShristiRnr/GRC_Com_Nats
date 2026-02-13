
export interface Role {
    id: string
    name: string
    description: string
    permissions: string[]
    users_count: number
    created_at: string
}

export interface User {
    id: string
    email: string
    full_name: string
    role_id: string
    role: { name: string }
    status: 'active' | 'inactive' | 'invited'
    created_at: string
}

export interface Department {
    id: string
    name: string
    manager_id: string | null
    parent_id: string | null
    users_count: number
}

const MOCK_ROLES: Role[] = [
    { id: '1', name: 'Administrator', description: 'Full access to all resources', permissions: ['admin.all'], users_count: 2, created_at: new Date().toISOString() },
    { id: '2', name: 'Compliance Officer', description: 'Manage compliance frameworks and controls', permissions: ['compliance.write', 'risk.read'], users_count: 3, created_at: new Date().toISOString() },
    { id: '3', name: 'Risk Manager', description: 'Manage risks and assessments', permissions: ['risk.write', 'compliance.read'], users_count: 1, created_at: new Date().toISOString() },
    { id: '4', name: 'General User', description: 'Read-only access to assigned tasks', permissions: ['tasks.read'], users_count: 15, created_at: new Date().toISOString() },
]

const MOCK_USERS: User[] = [
    { id: '1', email: 'admin@example.com', full_name: 'Admin User', role_id: '1', role: { name: 'Administrator' }, status: 'active', created_at: new Date().toISOString() },
    { id: '2', email: 'jane@example.com', full_name: 'Jane Doe', role_id: '2', role: { name: 'Compliance Officer' }, status: 'active', created_at: new Date().toISOString() },
    { id: '3', email: 'john@example.com', full_name: 'John Smith', role_id: '4', role: { name: 'General User' }, status: 'inactive', created_at: new Date().toISOString() },
]

const MOCK_DEPARTMENTS: Department[] = [
    { id: '1', name: 'Engineering', manager_id: '1', parent_id: null, users_count: 10 },
    { id: '2', name: 'HR', manager_id: '2', parent_id: null, users_count: 5 },
    { id: '3', name: 'Security', manager_id: '1', parent_id: '1', users_count: 3 },
]

export async function getRoles(): Promise<Role[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return MOCK_ROLES
}

export async function getUsers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return MOCK_USERS
}

export async function getDepartments(): Promise<Department[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return MOCK_DEPARTMENTS
}

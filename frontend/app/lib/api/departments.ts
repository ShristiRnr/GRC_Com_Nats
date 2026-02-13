
export interface Department {
    id: string
    name: string
    head_id?: string
    description?: string
}

const MOCK_DEPARTMENTS: Department[] = [
    { id: "dept_1", name: "Engineering", description: "Software development and infrastructure" },
    { id: "dept_2", name: "HR", description: "Human Resources" },
    { id: "dept_3", name: "Finance", description: "Finance and Accounting" },
    { id: "dept_4", name: "IT", description: "Information Technology Support" },
    { id: "dept_5", name: "Legal", description: "Legal and Compliance" },
]


export async function getDepartments(): Promise<Department[]> {
    const res = await fetch('/api/departments');
    if (!res.ok) {
        // Return empty if endpoint fails or 404 (if not deployed)
        // But for development we retry/error
        if (res.status === 404) return [];
        throw new Error('Failed to fetch departments');
    }
    return res.json();
}


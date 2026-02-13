
import { fetchWithAuth } from "../api";

export interface Program {
    id: string
    name: string
    description?: string | null
    status: 'planning' | 'active' | 'completed' | 'paused' | 'closed'
    type: 'internal_audit' | 'external_audit' | 'assessment'
    start_date: string | null
    end_date: string | null
    progress: number
    assessor_id?: string | null
    assessor?: { full_name: string; avatar_url?: string }
    // Scope relations (populated when needed)
    frameworks?: { id: string; name: string }[]
    departments?: { id: string; name: string }[]

    assets?: { id: string; name: string }[]
    controls?: { id: string; code: string; title: string; category?: string }[]
    stats?: {
        totalTasks: number
        completedTasks: number
        inProgressTasks: number
        overdueTasks: number
        controlCount: number
        riskCount: number
        progress: number
    }
    assignees?: { full_name: string }[]
    daysLeft?: number
}

export async function getPrograms(): Promise<Program[]> {
    const res = await fetchWithAuth('/api/programs');
    if (!res.ok) throw new Error('Failed to fetch programs');
    return res.json();
}

export async function getProgram(id: string): Promise<Program | undefined> {
    const res = await fetchWithAuth(`/api/programs/${id}`);
    if (!res.ok) {
        if (res.status === 404) return undefined;
        throw new Error('Failed to fetch program');
    }
    return res.json();
}


export async function deleteProgram(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/programs/${id}`, { method: 'DELETE' });
    if (!res.ok) {
        // If 404, maybe already deleted
        if (res.status === 404) return;
        throw new Error('Failed to delete program');
    }
}

export interface CreateProgramInput {
    name: string
    description?: string
    type: 'internal_audit' | 'external_audit' | 'assessment'
    start_date?: string
    end_date?: string
    framework_ids: string[]
    department_ids: string[]
    asset_ids: string[]
    control_ids: string[]
    assessor_id?: string
}

export async function createProgram(input: CreateProgramInput): Promise<{ success: boolean; programId: string }> {
    const res = await fetchWithAuth('/api/programs', {
        method: 'POST',
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create program');
    }

    const program = await res.json();
    return { success: true, programId: program.id };
}

import { fetchWithAuth } from "../api";

export interface Task {
    id: string;
    program_id: string;
    control_id: string;
    asset_id?: string;
    owner_id?: string;
    reviewer_id?: string;
    assessor_id?: string;
    title: string;
    description?: string;
    status: 'todo' | 'submitted' | 'in_review' | 'refer_back' | 'approved' | 'in_assessment' | 'completed';
    result?: string;
    due_date?: string;
    notes?: string;
    reviewer_notes?: string;
    assessor_notes?: string;
    visible_to_assignee: boolean;
    task_type: string;
    evidence_required?: any;
    created_at: string;
    updated_at: string;
    org_id: string;
    // Related fields
    control?: { code: string; title: string; description?: string };
    program?: { name: string };
    owner?: { full_name: string; email: string };
    reviewer?: { full_name: string; email: string };
    assessor?: { full_name: string; email: string };
}

export interface Evidence {
    id: string;
    task_id: string;
    file_path: string;
    file_name: string;
    checksum: string;
    uploaded_by?: string;
    uploaded_at: string;
}

export async function getTasks(orgId: string): Promise<Task[]> {
    const response = await fetchWithAuth(`/api/tasks?org_id=${orgId}`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const data = await response.json();
    return data || [];
}

export async function getTask(id: string): Promise<Task> {
    const response = await fetchWithAuth(`/api/tasks/${id}`);
    if (!response.ok) throw new Error('Failed to fetch task');
    return response.json();
}

export async function createTask(task: Partial<Task>): Promise<Task> {
    const response = await fetchWithAuth('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
}

export async function updateTaskStatus(id: string, updates: {
    status: string;
    result?: string;
    notes?: string;
    reviewer_notes?: string;
    assessor_notes?: string
}): Promise<Task> {
    const response = await fetchWithAuth(`/api/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update task status');
    return response.json();
}

export async function assignTaskActors(id: string, actors: {
    owner_id?: string;
    reviewer_id?: string;
    assessor_id?: string
}): Promise<Task> {
    const response = await fetchWithAuth(`/api/tasks/${id}/actors`, {
        method: 'PATCH',
        body: JSON.stringify(actors),
    });
    if (!response.ok) throw new Error('Failed to assign task actors');
    return response.json();
}

export async function uploadEvidence(taskId: string, evidence: { file_path: string; file_name: string; checksum: string; uploaded_by?: string }): Promise<Evidence> {
    const response = await fetchWithAuth(`/api/tasks/${taskId}/evidence`, {
        method: 'POST',
        body: JSON.stringify(evidence),
    });
    if (!response.ok) throw new Error('Failed to upload evidence');
    return response.json();
}

export async function getTaskEvidence(taskId: string): Promise<Evidence[]> {
    const response = await fetchWithAuth(`/api/tasks/${taskId}/evidence`);
    if (!response.ok) throw new Error('Failed to fetch evidence');
    return response.json();
}

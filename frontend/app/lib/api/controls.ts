import { fetchWithAuth } from "../api";

export interface Evidence {
    id: string
    name: string
    description?: string
    evidence_type: string
    file_name?: string
    file_path?: string
    external_url?: string
    collected_at?: string
    is_valid: boolean
    checksum?: string
    created_at: string
}

export interface ControlTask {
    id: string
    status: string
    result?: string
    due_date?: string
    program_name?: string
    completed_at?: string
}

export interface ControlAsset {
    id: string
    name: string
    type: string
    criticality: string
    status: string
    implementation_notes?: string
    coverage_status?: string
}

export interface ControlRisk {
    id: string
    title: string
    description?: string
    inherent_impact: number
    inherent_likelihood: number
    status: string
    notes?: string
    effectiveness?: string
}

export interface Control {
    id: string
    code: string
    title: string
    description?: string
    category?: string
    status: 'active' | 'draft'
    framework_id?: string
    framework_name?: string
    framework_names?: string
    framework_count?: number
    frameworks?: { name: string }[]
    evidence?: Evidence[]
    tasks?: ControlTask[]
    assets?: ControlAsset[]
    risks?: ControlRisk[]
    department_id?: string
    domain?: { id: string; name: string }
    owner?: { id: string; full_name: string; email: string; avatar_url: string | null }
    compliance_status?: string | null
    asset_count?: number
    risk_count?: number
    max_risk_score?: number
    created_at?: string
    updated_at?: string
    org_id?: string
}

export interface ControlStats {
    total_controls: number
    active_controls: number
    draft_controls: number
    mapped_controls: number
    unique_categories: number
}

export async function getControls(frameworkId?: string): Promise<Control[]> {
    const url = frameworkId
        ? `/api/controls?framework_id=${frameworkId}`
        : '/api/controls';

    try {
        const res = await fetchWithAuth(url);
        if (res.ok) return res.json();
        return [];
    } catch (e) {
        console.error("Failed to fetch controls", e);
        return [];
    }
}

export async function getControl(id: string): Promise<Control> {
    const response = await fetchWithAuth(`/api/controls/${id}`);
    if (!response.ok) throw new Error('Failed to fetch control');
    return response.json();
}

export async function updateControl(id: string, data: Partial<Control>): Promise<Control> {
    const response = await fetchWithAuth(`/api/controls/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update control');
    return response.json();
}

export async function getControlStats(): Promise<ControlStats> {
    try {
        const res = await fetchWithAuth('/api/controls/stats');
        if (res.ok) return res.json();
        throw new Error('Failed to fetch stats');
    } catch (e) {
        console.error("Failed to fetch control stats", e);
        return {
            total_controls: 0,
            active_controls: 0,
            draft_controls: 0,
            mapped_controls: 0,
            unique_categories: 0
        };
    }
}

export async function createControl(input: {
    code: string
    title: string
    description?: string
    category?: string
    framework_id: string
    status?: string
}): Promise<Control> {
    const response = await fetchWithAuth('/api/controls', {
        method: 'POST',
        body: JSON.stringify(input),
    })

    if (!response.ok) {
        throw new Error('Failed to create control')
    }

    return response.json()
}

export async function deleteControl(id: string): Promise<void> {
    const response = await fetchWithAuth(`/api/controls/${id}`, {
        method: 'DELETE',
    })

    if (!response.ok) {
        throw new Error('Failed to delete control')
    }
}

export async function getAssetControlMappings(): Promise<Record<string, string[]>> {
    try {
        const res = await fetchWithAuth('/api/assets/controls'); // Assuming this exists or returns empty for now
        if (res.ok) return res.json();
        return {};
    } catch (e) {
        return {};
    }
}

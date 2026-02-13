import { fetchWithAuth } from "../api";

export interface Control {
    id: string
    code: string
    title: string
    description?: string
    category?: string
    status: string
    org_id: string
    created_at: string
    updated_at: string
    // Enriched fields
    compliance_status?: string
    asset_count?: number
    risk_count?: number
}

export interface Framework {
    id: string
    name: string
    description?: string
    version?: string
    status: 'draft' | 'published' | 'archived'
    control_count: number
    progress: number
    created_at: string
    updated_at: string
    org_id: string
}

export async function getFrameworks(): Promise<Framework[]> {
    try {
        const response = await fetchWithAuth('/api/frameworks');
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.error("Error fetching frameworks", e);
        return [];
    }
}

export async function getFramework(id: string): Promise<Framework> {
    const response = await fetchWithAuth(`/api/frameworks/${id}`);
    if (!response.ok) throw new Error('Failed to fetch framework');
    return response.json();
}

export async function createFramework(input: {
    name: string;
    version?: string;
    description?: string;
}): Promise<Framework> {
    const response = await fetchWithAuth('/api/frameworks', {
        method: 'POST',
        body: JSON.stringify({
            ...input,
            status: 'draft'
        }),
    });

    if (!response.ok) throw new Error('Failed to create framework');
    return response.json();
}

export async function updateFramework(id: string, data: {
    name: string;
    description?: string;
    version?: string;
}): Promise<Framework> {
    const response = await fetchWithAuth(`/api/frameworks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update framework');
    return response.json();
}

export async function updateFrameworkStatus(id: string, status: string): Promise<Framework> {
    const response = await fetchWithAuth(`/api/frameworks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error('Failed to update framework status');
    return response.json();
}

export async function deleteFramework(id: string): Promise<void> {
    const response = await fetchWithAuth(`/api/frameworks/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete framework');
}

// Control Mapping
export async function getFrameworkControls(id: string): Promise<Control[]> {
    const response = await fetchWithAuth(`/api/frameworks/${id}/controls`);
    if (!response.ok) throw new Error('Failed to fetch framework controls');
    return response.json();
}

export async function getAvailableControls(id: string): Promise<Control[]> {
    const response = await fetchWithAuth(`/api/frameworks/${id}/available-controls`);
    if (!response.ok) throw new Error('Failed to fetch available controls');
    return response.json();
}

export async function mapControls(frameworkId: string, controlIds: string[]): Promise<void> {
    const response = await fetchWithAuth(`/api/frameworks/${frameworkId}/map`, {
        method: 'POST',
        body: JSON.stringify({ controlIds }),
    });
    if (!response.ok) throw new Error('Failed to map controls');
}

export async function unmapControls(frameworkId: string, controlIds: string[]): Promise<void> {
    const response = await fetchWithAuth(`/api/frameworks/${frameworkId}/unmap`, {
        method: 'POST',
        body: JSON.stringify({ controlIds }),
    });
    if (!response.ok) throw new Error('Failed to unmap controls');
}
export async function getPublishedFrameworks(): Promise<Framework[]> {
    try {
        const response = await fetchWithAuth('/api/frameworks');
        if (!response.ok) return [];
        const frameworks: Framework[] = await response.json();
        return frameworks.filter(f => f.status === 'published');
    } catch (e) {
        console.error("Error fetching published frameworks", e);
        return [];
    }
}

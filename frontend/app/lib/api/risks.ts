import { fetchWithAuth } from "../api";

export interface Risk {
    id: string;
    org_id: string;
    title: string;
    description?: string;
    inherent_impact: number;
    inherent_likelihood: number;
    residual_impact?: number;
    residual_likelihood?: number;
    status: 'identified' | 'assessed' | 'mitigated' | 'mitigating' | 'accepted' | 'closed';
    treatment_plan?: string;
    owner_id?: string;
    source_task_id?: string;
    category?: string;
    response_strategy?: string;
    mitigation_plan?: string;
    review_date?: string;
    created_at: string;
    updated_at: string;
}

export interface RiskControl {
    risk_id: string;
    control_id: string;
    effectiveness?: string;
    notes?: string;
    mapped_at: string;
}

export async function getRisks(orgId: string): Promise<Risk[]> {
    const response = await fetchWithAuth(`/api/risks?org_id=${orgId}`);
    if (!response.ok) throw new Error('Failed to fetch risks');
    return response.json();
}

export async function getRisk(id: string): Promise<Risk> {
    const response = await fetchWithAuth(`/api/risks/${id}`);
    if (!response.ok) throw new Error('Failed to fetch risk');
    return response.json();
}

export async function createRisk(risk: Partial<Risk>): Promise<Risk> {
    const response = await fetchWithAuth('/api/risks', {
        method: 'POST',
        body: JSON.stringify(risk),
    });
    if (!response.ok) throw new Error('Failed to create risk');
    return response.json();
}

export async function updateRisk(id: string, risk: Partial<Risk>): Promise<Risk> {
    const response = await fetchWithAuth(`/api/risks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(risk),
    });
    if (!response.ok) throw new Error('Failed to update risk');
    return response.json();
}

export async function deleteRisk(id: string): Promise<void> {
    const response = await fetchWithAuth(`/api/risks/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete risk');
}

export async function linkRiskToControl(riskId: string, controlId: string, effectiveness?: string, notes?: string): Promise<void> {
    const response = await fetchWithAuth(`/api/risks/${riskId}/controls`, {
        method: 'POST',
        body: JSON.stringify({ risk_id: riskId, control_id: controlId, effectiveness, notes }),
    });
    if (!response.ok) throw new Error('Failed to link risk to control');
}

export async function getRiskControls(riskId: string): Promise<RiskControl[]> {
    const response = await fetchWithAuth(`/api/risks/${riskId}/controls`);
    if (!response.ok) throw new Error('Failed to fetch risk controls');
    return response.json();
}

export async function unlinkRiskFromControl(riskId: string, controlId: string): Promise<void> {
    const response = await fetchWithAuth(`/api/risks/${riskId}/controls/${controlId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to unlink risk');
}

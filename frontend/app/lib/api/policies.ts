import { fetchWithAuth } from "../api";

export interface Policy {
    id: string;
    title: string;
    status: string;
    content: string | null;
    version: string;
    last_reviewed: string;
    next_review: string;
    owner_id?: string;
    owner?: { full_name: string; avatar_url?: string };
    org_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PolicyClause {
    id: string;
    policy_id: string;
    clause_id: string;
    content: string;
    control_id: string;
    created_at: string;
}

export async function getPolicies(): Promise<Policy[]> {
    const response = await fetchWithAuth('/api/policies');
    if (!response.ok) throw new Error('Failed to fetch policies');
    return response.json();
}

export async function getPolicy(id: string): Promise<Policy> {
    const response = await fetchWithAuth(`/api/policies/${id}`);
    if (!response.ok) throw new Error('Failed to fetch policy');
    return response.json();
}

export async function createPolicy(policy: { title: string; content: string }): Promise<Policy> {
    const response = await fetchWithAuth('/api/policies', {
        method: 'POST',
        body: JSON.stringify(policy),
    });
    if (!response.ok) throw new Error('Failed to create policy');
    return response.json();
}

export async function deletePolicy(id: string): Promise<void> {
    const response = await fetchWithAuth(`/api/policies/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete policy');
}

export async function getPolicyClauses(id: string): Promise<PolicyClause[]> {
    const response = await fetchWithAuth(`/api/policies/${id}/clauses`);
    if (!response.ok) throw new Error('Failed to fetch policy clauses');
    return response.json();
}

export async function createPolicyClause(policyId: string, clause: { clause_id: string; content: string; control_id: string }): Promise<PolicyClause> {
    const response = await fetchWithAuth(`/api/policies/${policyId}/clauses`, {
        method: 'POST',
        body: JSON.stringify({ policy_id: policyId, ...clause }),
    });
    if (!response.ok) throw new Error('Failed to create policy clause');
    return response.json();
}

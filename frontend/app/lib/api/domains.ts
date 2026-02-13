import { fetchWithAuth } from "../api";

export interface Domain {
    id: string
    name: string
    description?: string
}

export async function getDomains(): Promise<Domain[]> {
    try {
        const res = await fetchWithAuth('/api/domains');
        if (res.ok) return res.json();
        return [];
    } catch (e) {
        console.error("Failed to fetch domains", e);
        return [];
    }
}

export async function createDomain(name: string): Promise<Domain> {
    const response = await fetchWithAuth('/api/domains', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create domain');
    return response.json();
}

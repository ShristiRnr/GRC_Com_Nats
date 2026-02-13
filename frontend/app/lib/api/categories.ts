import { fetchWithAuth } from "../api";

export interface Category {
    id: string
    name: string
    description?: string
}

export async function getCategories(): Promise<Category[]> {
    try {
        const res = await fetchWithAuth('/api/categories');
        if (res.ok) return res.json();
        return [];
    } catch (e) {
        console.error("Failed to fetch categories", e);
        return [];
    }
}

export async function createCategory(name: string): Promise<Category> {
    const response = await fetchWithAuth('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
}

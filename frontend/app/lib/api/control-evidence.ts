import { fetchWithAuth } from "../api";

export async function addEvidence(formData: FormData): Promise<{ success: boolean }> {
    const controlId = formData.get('controlId')
    const response = await fetchWithAuth(`/api/controls/${controlId}/evidence`, {
        method: 'POST',
        // fetchWithAuth should NOT set Content-Type to application/json when body is FormData
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to add evidence');
    }

    return { success: true };
}

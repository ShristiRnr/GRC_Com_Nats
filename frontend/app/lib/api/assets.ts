import { fetchWithAuth } from "../api";

export interface Asset {
    id: string;
    org_id: string;
    name: string;
    description?: string;
    type: string;
    category_id?: string;
    type_id?: string;
    department_id?: string;
    owner_id?: string;
    criticality: 'Low' | 'Medium' | 'High' | 'Critical';
    confidentiality: number;
    integrity: number;
    availability: number;
    status: 'active' | 'archived' | 'disposed';
    location?: string;
    lifecycle_stage?: string;
    compliance_status?: string;
    ip_address?: string;
    serial_number?: string;
    purchase_date?: string;
    warranty_expiry?: string;
    created_at: string;
    updated_at: string;
    // Related fields for UI
    asset_type?: { name: string };
    category?: { name: string };
    department?: { name: string };
    owner?: { full_name: string };
}

export interface AssetCategory {
    id: string;
    org_id?: string;
    name: string;
    description?: string;
}

export interface AssetType {
    id: string;
    org_id?: string;
    name: string;
    category_id: string;
    description?: string;
}

export async function getAssets(orgId: string = ''): Promise<Asset[]> {
    const response = await fetchWithAuth(`/api/assets?org_id=${orgId}`);
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
}

export async function getAsset(id: string): Promise<Asset> {
    const response = await fetchWithAuth(`/api/assets/${id}`);
    if (!response.ok) throw new Error('Failed to fetch asset');
    return response.json();
}

export async function createAsset(asset: Partial<Asset>): Promise<Asset> {
    const response = await fetchWithAuth('/api/assets', {
        method: 'POST',
        body: JSON.stringify(asset),
    });
    if (!response.ok) throw new Error('Failed to create asset');
    return response.json();
}

export async function updateAsset(id: string, asset: Partial<Asset>): Promise<Asset> {
    const response = await fetchWithAuth(`/api/assets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(asset),
    });
    if (!response.ok) throw new Error('Failed to update asset');
    return response.json();
}

export async function deleteAsset(id: string): Promise<void> {
    const response = await fetchWithAuth(`/api/assets/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete asset');
}

export async function getAssetCategories(): Promise<AssetCategory[]> {
    const response = await fetchWithAuth('/api/asset-categories');
    if (!response.ok) throw new Error('Failed to fetch asset categories');
    return response.json();
}

export async function getAssetTypes(): Promise<AssetType[]> {
    const response = await fetchWithAuth('/api/asset-types');
    if (!response.ok) throw new Error('Failed to fetch asset types');
    return response.json();
}

export async function linkAssetToControl(assetId: string, controlId: string, notes?: string): Promise<void> {
    const response = await fetchWithAuth(`/api/controls/${controlId}/assets`, {
        method: 'POST',
        body: JSON.stringify({ asset_id: assetId, notes }),
    });
    if (!response.ok) throw new Error('Failed to link asset');
}

export async function unlinkAssetFromControl(assetId: string, controlId: string): Promise<void> {
    const response = await fetchWithAuth(`/api/controls/${controlId}/assets/${assetId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to unlink asset');
}

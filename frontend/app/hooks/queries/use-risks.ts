import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getRisks, getRisk } from "~/lib/api/risks";
import type { Risk } from "~/lib/api/risks";

// Types matching v1
export interface RiskResponse extends Risk { }

export interface RiskStatsResponse {
    total_count: number;
    identified_count: number;
    mitigating_count: number;
    mitigated_count: number;
    accepted_count: number;
    closed_count: number;
    high_risk_count: number;
    critical_risk_count: number;
    avg_inherent_score: number;
    avg_residual_score: number;
}

export interface RiskMatrixCellResponse {
    likelihood: number;
    impact: number;
    count: number;
}

/**
 * Fetch all risks with optional filters
 */
export function useRisks(orgId: string, params?: {
    search?: string;
    category?: string;
    status?: string;
    min_score?: number;
    page?: number;
    per_page?: number;
}) {
    return useQuery({
        queryKey: queryKeys.risks.list({ orgId, ...params }),
        queryFn: async () => {
            if (!orgId) return { items: [], total: 0, page: 1, per_page: 20, total_pages: 0 };
            const data = await getRisks(orgId);

            // Client-side filtering to match v1 behavior if API doesn't support it yet
            let items = data || [];

            if (params?.search) {
                const searchLower = params.search.toLowerCase();
                items = items.filter(r => r.title.toLowerCase().includes(searchLower));
            }
            if (params?.status) {
                items = items.filter(r => r.status === params.status);
            }
            if (params?.category) {
                items = items.filter(r => r.category === params.category);
            }

            // Calculate scores
            const itemsWithScores = items.map(r => ({
                ...r,
                inherent_risk_score: (r.inherent_impact || 0) * (r.inherent_likelihood || 0),
                residual_risk_score: (r.residual_impact || 0) * (r.residual_likelihood || 0),
            }));

            const filteredItems = params?.min_score
                ? itemsWithScores.filter(r => r.inherent_risk_score >= params.min_score!)
                : itemsWithScores;


            return {
                items: filteredItems,
                total: filteredItems.length,
                page: params?.page || 1,
                per_page: params?.per_page || 20,
                total_pages: Math.ceil(filteredItems.length / (params?.per_page || 20)),
            };
        },
    });
}

/**
 * Fetch a single risk by ID
 */
export function useRisk(id: string) {
    return useQuery({
        queryKey: queryKeys.risks.detail(id),
        queryFn: async () => {
            const data = await getRisk(id);
            return {
                ...data,
                inherent_risk_score: (data.inherent_impact || 0) * (data.inherent_likelihood || 0),
                residual_risk_score: (data.residual_impact || 0) * (data.residual_likelihood || 0),
            };
        },
        enabled: !!id,
    });
}

/**
 * Fetch risk statistics
 */
export function useRiskStats(orgId: string) {
    return useQuery({
        queryKey: queryKeys.risks.stats(orgId),
        queryFn: async () => {
            if (!orgId) return null;
            // Use existing API if available, else compute from list
            // For v2 parity, we might need to fetch all risks and compute
            const risks = await getRisks(orgId);

            const risksWithScores = risks.map(r => ({
                ...r,
                inherent_risk_score: (r.inherent_impact || 0) * (r.inherent_likelihood || 0),
                residual_risk_score: (r.residual_impact || 0) * (r.residual_likelihood || 0),
            }));

            const total = risksWithScores.length;
            const critical = risksWithScores.filter(r => r.inherent_risk_score >= 20).length;
            const high = risksWithScores.filter(r => r.inherent_risk_score >= 15 && r.inherent_risk_score < 20).length;

            const stats: RiskStatsResponse = {
                total_count: total,
                identified_count: risksWithScores.filter(r => r.status === "identified").length,
                mitigating_count: risksWithScores.filter(r => r.status === "mitigating").length,
                mitigated_count: risksWithScores.filter(r => r.status === "mitigated").length,
                accepted_count: risksWithScores.filter(r => r.status === "accepted").length,
                closed_count: risksWithScores.filter(r => r.status === "closed").length,
                high_risk_count: high,
                critical_risk_count: critical,
                avg_inherent_score: total > 0 ? risksWithScores.reduce((acc, r) => acc + r.inherent_risk_score, 0) / total : 0,
                avg_residual_score: total > 0 ? risksWithScores.reduce((acc, r) => acc + r.residual_risk_score, 0) / total : 0,
            };

            return stats;
        },
    });
}


/**
 * Fetch risk matrix data (heatmap)
 */
export function useRiskMatrix(orgId: string) {
    return useQuery({
        queryKey: queryKeys.risks.matrix(orgId),
        queryFn: async () => {
            if (!orgId) return [];
            const risks = await getRisks(orgId);

            const matrix: RiskMatrixCellResponse[] = [];

            for (let impact = 1; impact <= 5; impact++) {
                for (let likelihood = 1; likelihood <= 5; likelihood++) {
                    const count = risks.filter(
                        (r) =>
                            r.inherent_likelihood === likelihood &&
                            r.inherent_impact === impact
                    ).length;

                    if (count > 0) {
                        matrix.push({ likelihood, impact, count });
                    }
                }
            }

            return matrix;
        },
    });
}


export interface ComplianceFramework {
    id: string
    name: string
    control_count: number
}

export interface ComplianceStats {
    totalTasks: number
    completedTasks: number
    compliantTasks: number
    nonCompliantTasks: number
    activePrograms: number
    completedPrograms: number
    totalRisks: number
    criticalRisks: number
    mitigatedRisks: number
    complianceRate: number
    taskCompletionRate: number
}

export interface ComplianceData {
    frameworks: ComplianceFramework[]
    stats: ComplianceStats
}

const MOCK_COMPLIANCE_DATA: ComplianceData = {
    frameworks: [
        { id: '1', name: 'SOC 2 Type II', control_count: 85 },
        { id: '2', name: 'ISO 27001:2013', control_count: 114 },
        { id: '3', name: 'GDPR', control_count: 55 },
        { id: '4', name: 'HIPAA', control_count: 64 },
    ],
    stats: {
        totalTasks: 45,
        completedTasks: 32,
        compliantTasks: 28,
        nonCompliantTasks: 2,
        activePrograms: 4,
        completedPrograms: 1,
        totalRisks: 12,
        criticalRisks: 3,
        mitigatedRisks: 5,
        complianceRate: 88,
        taskCompletionRate: 71,
    }
}

export async function getComplianceStats(): Promise<ComplianceData> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600))
    return MOCK_COMPLIANCE_DATA
}

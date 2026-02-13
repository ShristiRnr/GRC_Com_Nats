

export interface DashboardStats {
    overall_score: number
    open_tasks: number
    high_risks: number
    total_controls: number
    total_policies: number
    total_risks: number
    active_programs: number
    total_frameworks: number
    task_distribution: {
        todo: number
        submitted: number
        in_review: number
        approved: number
        completed: number
    }
    risk_severity: {
        critical: number
        high: number
        medium: number
        low: number
    }
    next_audit: {
        days_left: number
        name: string
    } | null
    frameworks: {
        id: string
        name: string
        percentage: number
        total_controls?: number
        compliant_controls?: number
    }[]
    recent_activity: {
        id: string
        details: string
        actor_name: string
        timestamp: string
    }[]
    my_tasks: {
        id: string
        control: {
            title: string
        } | null
        program: {
            name: string
        } | null
        due_date: string | null
    }[]
    compliance_stats: {
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
}

const MOCK_DASHBOARD_STATS: DashboardStats = {
    overall_score: 78,
    open_tasks: 12,
    high_risks: 3,
    total_controls: 142,
    total_policies: 18,
    total_risks: 8,
    active_programs: 4,
    total_frameworks: 4,
    task_distribution: {
        todo: 5,
        submitted: 3,
        in_review: 2,
        approved: 4,
        completed: 18
    },
    risk_severity: {
        critical: 1,
        high: 2,
        medium: 3,
        low: 2
    },
    next_audit: {
        days_left: 14,
        name: 'ISO 27001 Surveillance'
    },
    frameworks: [
        { id: '1', name: 'SOC 2 Type II', percentage: 85, total_controls: 50, compliant_controls: 42 },
        { id: '2', name: 'ISO 27001:2013', percentage: 72, total_controls: 40, compliant_controls: 29 },
        { id: '3', name: 'GDPR', percentage: 65, total_controls: 30, compliant_controls: 19 },
        { id: '4', name: 'HIPAA', percentage: 90, total_controls: 22, compliant_controls: 20 },
    ],
    recent_activity: [
        { id: '1', details: 'Updated Access Control Policy', actor_name: 'Admin User', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { id: '2', details: 'Completed Risk Assessment for AWS', actor_name: 'John Doe', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        { id: '3', details: 'Uploaded Evidence for AC-2', actor_name: 'Jane Smith', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
        { id: '4', details: 'Approved Incident Response Plan', actor_name: 'Admin User', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
    ],
    my_tasks: [
        { id: '1', control: { title: 'Review User Access Logs' }, program: { name: 'Q1 Security Review' }, due_date: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString() },
        { id: '2', control: { title: 'Update Firewall Rules' }, program: { name: 'Infrastructure Hardening' }, due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString() },
        { id: '3', control: { title: 'Employee Training Compliance' }, program: { name: 'Annual Training' }, due_date: null },
    ],
    compliance_stats: {
        totalTasks: 45,
        completedTasks: 32,
        compliantTasks: 28,
        nonCompliantTasks: 4,
        activePrograms: 4,
        completedPrograms: 2,
        totalRisks: 8,
        criticalRisks: 1,
        mitigatedRisks: 3,
        complianceRate: 78,
        taskCompletionRate: 71
    }
}


export async function getDashboardStats(): Promise<DashboardStats> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))
    return MOCK_DASHBOARD_STATS
}


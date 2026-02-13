
export interface Notification {
    id: string
    title: string
    body: string
    icon: string
    link?: string
    created_at: string
    read_at?: string
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'New Framework Added',
        body: 'SOC 2 Type II framework has been added to your organization.',
        icon: 'book',
        link: '/frameworks/soc2',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    },
    {
        id: '2',
        title: 'Control Review Due',
        body: 'Access Control Policy review is due tomorrow.',
        icon: 'clock',
        link: '/controls/review/123',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
        id: '3',
        title: 'High Risk Detected',
        body: 'New vulnerability found in production database cluster.',
        icon: 'shield-alert',
        link: '/risks/456',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
        id: '4',
        title: 'Policy Approved',
        body: 'Data Retention Policy has been approved by the compliance team.',
        icon: 'check-circle',
        link: '/policies/789',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        read_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    },
]

export async function getNotifications({ limit = 10 }: { limit?: number } = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return { data: MOCK_NOTIFICATIONS.slice(0, limit), count: MOCK_NOTIFICATIONS.length }
}

export async function getUnreadCount() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return MOCK_NOTIFICATIONS.filter(n => !n.read_at).length
}

export async function markAsRead(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const notification = MOCK_NOTIFICATIONS.find(n => n.id === id)
    if (notification) {
        notification.read_at = new Date().toISOString()
    }
}

export async function markAllAsRead() {
    await new Promise(resolve => setTimeout(resolve, 500))
    MOCK_NOTIFICATIONS.forEach(n => {
        if (!n.read_at) {
            n.read_at = new Date().toISOString()
        }
    })
}

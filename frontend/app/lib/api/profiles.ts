
export interface Profile {
    id: string
    email: string
    full_name: string
    avatar_url?: string
    role?: string
}

const MOCK_PROFILES: Profile[] = [
    { id: "usr_1", email: "alice@example.com", full_name: "Alice Audit", role: "admin", avatar_url: "" },
    { id: "usr_2", email: "bob@example.com", full_name: "Bob Compliance", role: "editor", avatar_url: "" },
    { id: "usr_3", email: "carol@example.com", full_name: "Carol Manager", role: "viewer", avatar_url: "" },
]


export async function getProfiles(): Promise<Profile[]> {
    const res = await fetch('/api/users');
    if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error('Failed to fetch users');
    }
    const users = await res.json();
    return users.map((u: any) => ({
        id: u.id.toString(),
        email: u.email,
        full_name: u.username, // Using username as full_name for now
        avatar_url: u.avatar_url || '',
        role: u.role
    }));
}


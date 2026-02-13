export interface User {
    id: number;
    username: string;
    email: string;
    org_id: string;
    role: string;
}

let isRefreshing = false;
let refreshSubscribers: ((res: boolean) => void)[] = [];

function subscribeTokenRefresh(cb: (res: boolean) => void) {
    refreshSubscribers.push(cb);
}

function onRefreshed(res: boolean) {
    refreshSubscribers.map((cb) => cb(res));
    refreshSubscribers = [];
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);

    // Only set Content-Type if it's not already set AND body is not FormData
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: headers,
    });

    if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const refreshResponse = await api.refresh();
                if (refreshResponse.ok) {
                    isRefreshing = false;
                    onRefreshed(true);
                    return fetchWithAuth(url, options); // Retry original request
                }
            } catch (err) {
                // Refresh failed
            } finally {
                isRefreshing = false;
                onRefreshed(false);
            }
        } else {
            // Wait for refresh to complete
            return new Promise((resolve) => {
                subscribeTokenRefresh((success) => {
                    if (success) {
                        resolve(fetchWithAuth(url, options));
                    } else {
                        // If refresh fails, redirect to login might be needed
                        // But let the caller handle the 401
                        resolve(response);
                    }
                });
            });
        }
    }

    return response;
}

export const api = {
    getMe: () => fetchWithAuth('/auth/me'),
    login: (credentials: { username: string; password: string }) => fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    logout: () => fetchWithAuth('/auth/logout', { method: 'POST' }),
    refresh: () => fetch('/auth/refresh', { method: 'POST', credentials: 'include' }),

    // Setup endpoints
    getSetupStatus: () => fetch('/auth/setup/status'),
    setupSuperAdmin: (data: any) => fetch('/auth/setup', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    }),

    // Registration endpoints
    signup: (data: any) => fetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    }),
    verifyEmail: (token: string) => fetch(`/auth/verify/${token}`),
    resendVerification: (email: string) => fetch('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' }
    }),

    // Tasks
    createTask: (task: any) => fetchWithAuth('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
    }),
};


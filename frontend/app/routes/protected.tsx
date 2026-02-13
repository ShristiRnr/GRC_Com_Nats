import { redirect, Outlet } from "react-router";
import { api } from "../lib/api";

// Client-side loader to check setup status, then authentication
export async function clientLoader({ request }: { request: Request }) {
    const url = new URL(request.url);

    // First check if setup is completed
    try {
        const setupRes = await api.getSetupStatus();
        if (setupRes.ok) {
            const setupData = await setupRes.json();
            if (!setupData.setup_completed) {
                return redirect("/setup");
            }
        }
    } catch (err) {
        console.error("Failed to check setup status:", err);
    }

    // Then check authentication
    try {
        const res = await api.getMe();
        if (!res.ok) {
            return redirect(`/login?redirectTo=${url.pathname}`);
        }
        const user = await res.json();

        // Enforce email verification for protected route access
        if (!user.email_verified) {
            return redirect("/login?error=verify_pending");
        }

        return { user };
    } catch (err) {
        return redirect(`/login?redirectTo=${url.pathname}`);
    }
}

export default function ProtectedLayout() {
    return <Outlet />;
}

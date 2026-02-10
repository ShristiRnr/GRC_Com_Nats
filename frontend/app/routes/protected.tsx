import { redirect, Outlet } from "react-router";
import { api } from "../lib/api";

// Client-side loader to check authentication status
export async function clientLoader({ request }: { request: Request }) {
    const url = new URL(request.url);
    try {
        const res = await api.getMe();
        if (!res.ok) {
            return redirect(`/login?redirectTo=${url.pathname}`);
        }
        const user = await res.json();
        return { user };
    } catch (err) {
        return redirect(`/login?redirectTo=${url.pathname}`);
    }
}

export default function ProtectedLayout() {
    return <Outlet />;
}

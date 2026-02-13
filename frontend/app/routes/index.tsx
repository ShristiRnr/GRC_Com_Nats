import { redirect } from "react-router";
import { api } from "../lib/api";

// Gate route: checks setup status and redirects accordingly
export async function clientLoader() {
    try {
        const res = await api.getSetupStatus();
        if (res.ok) {
            const data = await res.json();
            if (data.setup_completed) {
                return redirect("/login");
            }
        }
    } catch (err) {
        console.error("Failed to check setup status:", err);
    }
    // Setup not completed (or check failed) → go to setup
    return redirect("/setup");
}

export default function Index() {
    // This component never renders — clientLoader always redirects
    return null;
}

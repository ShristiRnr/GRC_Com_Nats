import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    // Root gatekeeper: checks setup status, redirects to /login or /setup
    index("routes/index.tsx"),

    // Public routes (no auth required)
    route("login", "routes/login.tsx"),
    route("setup", "routes/setup.tsx"),
    route("verify-email/:token", "routes/verify-email.$token.tsx"),

    // Protected routes: auth guard → UI shell → pages
    layout("routes/protected.tsx", [
        layout("routes/app-layout.tsx", [
            // Dashboard Section
            route("dashboard", "routes/passthrough.tsx", [
                index("routes/dashboard/index.tsx"),
                route("compliance-status", "routes/dashboard/compliance-status.tsx"),
                route("tasks", "routes/dashboard/tasks.tsx"),
            ]),

            // Programs Section
            route("programs", "routes/programs/index.tsx"),
            route("programs/new", "routes/programs/new.tsx"),

            // Frameworks Section
            route("frameworks", "routes/frameworks/index.tsx"),
            route("frameworks/:id", "routes/frameworks/$id.tsx"),

            // Controls Section
            route("controls", "routes/controls/index.tsx"),
            route("controls/:id", "routes/controls/$id.tsx"),

            // Policies Section
            route("policies", "routes/policies/index.tsx"),
            route("policies/:id", "routes/policies/$id.tsx"),

            // Risks Section
            route("risks", "routes/risks/index.tsx"),

            // Assets Section
            route("assets", "routes/assets/index.tsx"),

            // Tasks Section
            route("tasks", "routes/tasks/index.tsx"),

            // Settings Section
            route("settings", "routes/settings/index.tsx"),
        ]),
    ]),

] satisfies RouteConfig;


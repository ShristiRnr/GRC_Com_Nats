import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    route("login", "routes/login.tsx"),
    route("setup", "routes/setup.tsx"),
    route("signup", "routes/signup.tsx"),
    layout("routes/protected.tsx", [
        index("routes/home.tsx"),
        route("dashboard", "routes/dashboard.tsx"),
        route("about", "routes/about.tsx"),
        route("contact", "routes/contact.tsx"),
    ]),
] satisfies RouteConfig;

import { useState } from "react";
import { Form, redirect, useActionData, useNavigation, useLoaderData } from "react-router";
import { ShieldAlert, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import type { Route } from "./+types/setup";

// Client-side check: Redirect if already set up
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
    return null;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
    const formData = await request.formData();
    const org_name = formData.get("orgName") as string;
    const username = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        const res = await api.setupSuperAdmin({ org_name, username, email, password });
        if (res.ok) {
            return redirect("/login");
        } else {
            const data = await res.json();
            return { error: data.error || "Setup failed" };
        }
    } catch (err) {
        return { error: "An unexpected error occurred" };
    }
}

export default function SetupPage() {
    const actionData = useActionData<{ error?: string }>();
    const navigation = useNavigation();
    const isLoading = navigation.state === "submitting";

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-4">
            <Card className="w-full max-w-md border-amber-200 dark:border-amber-900 shadow-lg bg-card">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full mb-2 flex items-center justify-center">
                        <ShieldAlert className="size-8 text-amber-600 dark:text-amber-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-card-foreground">Initial Setup</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Welcome to your GRC Platform. Please configure the master organization and super admin account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form method="post" className="space-y-4">
                        {actionData?.error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                                {actionData.error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="orgName">Master Organization Name</Label>
                            <Input
                                id="orgName"
                                name="orgName"
                                placeholder="e.g. Acme Corp (HQ)"
                                required
                                className="font-medium bg-background"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                This will be the primary tenant. Other organizations can be created later.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Super Admin Name</Label>
                            <Input id="fullName" name="fullName" placeholder="Administrator" required className="bg-background" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Admin Email</Label>
                            <Input id="email" name="email" type="email" placeholder="admin@local.host" required className="bg-background" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required minLength={8} className="bg-background" />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white mt-2 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="size-4 animate-spin" />}
                            {isLoading ? "Completing Setup..." : "Complete Setup"}
                        </Button>
                    </Form>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-center text-muted-foreground w-full">
                        This setup page will be disabled automatically after the first organization is created.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

// Internal UI Components to match Shadcn/Next.js design without hardcoding
function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>{children}</div>;
}

function CardHeader({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}

function CardDescription({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}

function CardContent({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

function CardFooter({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;
}

function Label({ children, htmlFor, className = "" }: { children: React.ReactNode, htmlFor: string, className?: string }) {
    return (
        <label
            htmlFor={htmlFor}
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
        >
            {children}
        </label>
    );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    );
}

function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}


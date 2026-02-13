import { useState, useEffect } from "react";
import { Form, redirect, useActionData, useNavigation, NavLink } from "react-router";
import { ShieldAlert, Loader2, Building, Mail, User, Lock, CheckCircle2, ShieldCheck } from "lucide-react";
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
        const data = await res.json();

        if (res.ok) {
            // Both fresh setup and "verification_pending" resend come back as 200 OK
            if (data.verification_pending) {
                return { success: true, email: data.email, resent: true };
            }
            return { success: true, email };
        } else {
            return { error: data.error || "Setup failed" };
        }
    } catch (err) {
        return { error: "An unexpected error occurred" };
    }
}

export default function SetupPage() {
    const actionData = useActionData<{ error?: string, success?: boolean, email?: string, resent?: boolean }>();
    const navigation = useNavigation();
    const isLoading = navigation.state === "submitting";
    const [isVerified, setIsVerified] = useState(false);

    // Poll for verification status when we are in the success state
    useEffect(() => {
        if (!actionData?.success) return;

        const checkStatus = async () => {
            try {
                const res = await api.getSetupStatus();
                if (res.ok) {
                    const data = await res.json();
                    if (data.setup_completed) {
                        setIsVerified(true);
                    }
                }
            } catch (err) {
                console.error("Failed to check status", err);
            }
        };

        // Check immediately then poll
        checkStatus();
        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, [actionData?.success]);

    return (
        <div className="flex min-h-screen w-full font-sans bg-white dark:bg-[#020617]">
            {/* Left Panel - Initialization Branding */}
            <div className="hidden lg:flex flex-col justify-between w-[55%] bg-[#0B0F19] p-16 text-white relative overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-[#0B0F19] to-[#0B0F19]" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Header / Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <img
                            src="/grcompli-logo.svg"
                            alt="GRCompli Logo"
                            className="w-28 h-28"
                        />
                    </div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-xl space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        System Initialization
                    </div>

                    <h1 className="text-5xl font-bold leading-tight tracking-tight text-white/95">
                        Establish the Foundation for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-amber-200">
                            Enterprise Risk Management
                        </span>
                    </h1>

                    <p className="text-lg text-slate-400 leading-relaxed font-light">
                        Configure your primary tenant and initialize the system-wide Super Admin account.
                        This process secures your instance and prepares it for multi-tenant deployment.
                    </p>

                    <div className="grid grid-cols-1 gap-4 pt-4">
                        {[
                            "Primary Organization Setup",
                            "Super Admin Role Assignment",
                            "System-Wide Security Policy Booting"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-slate-300 font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 pt-8 border-t border-white/5">
                    <p className="text-sm text-slate-500 font-medium">
                        &copy; 2026 GRCompli Inc. Secure Deployment Phase.
                    </p>
                </div>
            </div>

            {/* Right Panel - Setup Flow */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#020617] w-full border-l border-slate-100 dark:border-slate-800 relative overflow-y-auto">
                {actionData?.success ? (
                    /* Success View */
                    <div className="w-full max-w-[480px] mx-auto space-y-10 py-8 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="relative mx-auto w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-20" />
                            {isVerified ? (
                                <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-in zoom-in spin-in-90 duration-300" />
                            ) : (
                                <Mail className="w-10 h-10 text-emerald-500" />
                            )}
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {isVerified ? "Setup Complete!" : (actionData.resent ? "Verification Already Sent" : "Initialization Successful")}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[15px]">
                                {isVerified ? (
                                    <>Account verified. The system is now ready for use.</>
                                ) : (
                                    actionData.resent ? (
                                        <>An account with these credentials already exists and is pending verification. We have resent a fresh activation link to:</>
                                    ) : (
                                        <>Your enterprise organization has been established. We've sent an activation email to:</>
                                    )
                                )}
                                <br />
                                <strong className="text-slate-900 dark:text-white mt-1 block font-semibold">{actionData.email}</strong>
                            </p>
                        </div>

                        <div className={`p-6 border rounded-2xl text-left space-y-4 shadow-sm transition-colors duration-500 ${isVerified ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20" : "bg-blue-50 border-blue-200 dark:bg-blue-500/5 dark:border-blue-500/10"}`}>
                            <h3 className={`text-sm font-bold flex items-center gap-2 uppercase tracking-wider ${isVerified ? "text-emerald-900 dark:text-emerald-400" : "text-blue-900 dark:text-blue-400"}`}>
                                {isVerified ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                {isVerified ? "Verification Confirmed" : "Next Steps Required"}
                            </h3>
                            <div className="space-y-3">
                                <p className={`text-sm leading-relaxed font-bold uppercase tracking-tight ${isVerified ? "text-emerald-800/80 dark:text-emerald-400/80" : "text-blue-800/80 dark:text-blue-400/80"}`}>
                                    {isVerified ? "ACCESS GRANTED" : "LOGIN LOCKED UNTIL VERIFICATION"}
                                </p>
                                {!isVerified && (
                                    <p className="text-xs text-blue-700/60 dark:text-blue-500/60 leading-relaxed">
                                        Please click the link in your inbox to activate the Super Admin account and enable system-wide access.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            {isVerified ? (
                                <NavLink
                                    to="/login"
                                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 group px-8 animate-in fade-in slide-in-from-bottom-2"
                                >
                                    <span>Proceed to Login</span>
                                    <ShieldCheck className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </NavLink>
                            ) : (
                                <button
                                    disabled
                                    className="w-full h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-3 px-8 transition-all"
                                >
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Waiting for Verification...</span>
                                </button>
                            )}

                            {!isVerified && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse" />
                                    Waiting for account activation via email link
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Form View */
                    <div className="w-full max-w-[480px] mx-auto space-y-8 py-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex flex-col items-center mb-8 text-center px-4">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Initial Platform Setup</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-[15px]">
                                Enter the details to initialize your master organization and administrative account.
                            </p>
                        </div>

                        <Form method="post" className="space-y-6">
                            {actionData?.error && (
                                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 animate-in shake-1 duration-300">
                                    <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                                    <span className="text-red-600 dark:text-red-400 text-sm leading-relaxed">{actionData.error}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6">
                                {/* Organization Name */}
                                <div className="space-y-2">
                                    <label htmlFor="orgName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Master Organization Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors">
                                            <Building className="w-full h-full" />
                                        </div>
                                        <input
                                            id="orgName"
                                            name="orgName"
                                            type="text"
                                            placeholder="e.g. Acme Corp Headquarters"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-500 px-1 italic">
                                        This will be the primary root tenant of the platform.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Admin Name */}
                                    <div className="space-y-2">
                                        <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Super Admin Name
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors">
                                                <User className="w-full h-full" />
                                            </div>
                                            <input
                                                id="fullName"
                                                name="fullName"
                                                type="text"
                                                placeholder="John Doe"
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Admin Email */}
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Admin Email
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors">
                                                <Mail className="w-full h-full" />
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="admin@grcompli.com"
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Admin Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors">
                                            <Lock className="w-full h-full" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            minLength={8}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-[#0B0F19] hover:bg-[#1a202e] dark:bg-amber-600 dark:hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-black/5 dark:shadow-amber-600/10 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Complete System Initialization</span>
                                        <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        </Form>

                        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest pt-8">
                            Initialization procedure for authorized personnel only
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

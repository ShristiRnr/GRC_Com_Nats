import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, redirect, NavLink } from "react-router";
import { api } from "../lib/api";
import { ShieldCheck, Loader2, Lock, User, AlertCircle, CheckCircle2, ShieldAlert, Mail } from "lucide-react";

// Redirect to setup if setup is not completed
// Redirect to dashboard if already logged in and verified
export async function clientLoader() {
    try {
        const setupRes = await api.getSetupStatus();
        if (setupRes.ok) {
            const data = await setupRes.json();
            if (!data.setup_completed) {
                return redirect("/setup");
            }
        }

        const meRes = await api.getMe();
        if (meRes.ok) {
            const user = await meRes.json();
            if (user.email_verified) {
                return redirect("/dashboard");
            }
        }
    } catch (err) {
        console.error("Auth check failed:", err);
    }
    return null;
}

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const verificationProcessed = useRef(false);

    useEffect(() => {
        // Handle explicit verification pending error from layout
        if (searchParams.get("error") === "verify_pending") {
            setError("Account activation pending. Please verify your email first.");
        }

        const token = searchParams.get("token");
        if (token && !verificationProcessed.current && !verified) {
            verificationProcessed.current = true;
            handleVerifyEmail(token);
        }
    }, [searchParams, verified]);

    const handleVerifyEmail = async (token: string) => {
        setVerifying(true);
        try {
            const res = await api.verifyEmail(token);
            const data = await res.json();
            if (res.ok) {
                setVerified(true);
                if (data.username) {
                    setIdentifier(data.username);
                }
            } else {
                setError(data.error || "Verification failed. The link may be expired.");
            }
        } catch (err) {
            setError("Connection error during verification.");
        } finally {
            setVerifying(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.login({ username: identifier, password });
            if (res.ok) {
                const redirectTo = searchParams.get("redirectTo") || "/dashboard";
                navigate(redirectTo);
            } else {
                const data = await res.json();
                const errorMsg = data.error || "Login failed";
                if (errorMsg.toLowerCase().includes("verify") || errorMsg.toLowerCase().includes("active")) {
                    setError("Account activation pending. Please verify your email first.");
                } else {
                    setError(errorMsg);
                }
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full font-sans bg-white dark:bg-[#020617]">
            {/* Left Panel - Premium Enterprise Branding */}
            <div className="hidden lg:flex flex-col justify-between w-[55%] bg-[#0B0F19] p-16 text-white relative overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-[#0B0F19] to-[#0B0F19]" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

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
                    <h1 className="text-5xl font-bold leading-tight tracking-tight text-white/95">
                        The Operating System for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-emerald-400">
                            Modern Compliance
                        </span>
                    </h1>

                    <p className="text-lg text-slate-400 leading-relaxed font-light">
                        Streamline your governance, manage risk with precision, and automate compliance audits.
                        Built for enterprises that demand security and scale.
                    </p>

                    <div className="grid grid-cols-1 gap-4 pt-4">
                        {[
                            "SOC 2 Type II & ISO 27001 Ready",
                            "Automated Evidence Collection",
                            "Continuous Control Monitoring"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-slate-300 font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer / Quote */}
                <div className="relative z-10 pt-8 border-t border-white/5">
                    <p className="text-sm text-slate-500 font-medium">
                        &copy; 2026 GRCompli Inc. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#020617] w-full border-l border-slate-100 dark:border-slate-800 relative overflow-y-auto">
                <div className="w-full max-w-[440px] mx-auto space-y-8 py-8">
                    <div className="flex flex-col items-center mb-8 text-center px-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                            <Lock className="w-3 h-3" />
                            Secure Access Point
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">System Login</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-[15px]">
                            Enter your credentials to access the compliance governance dashboard.
                        </p>
                    </div>

                    {/* Setup success banner */}
                    {searchParams.get("setup") === "success" && (
                        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 text-center animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                            <div className="relative mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                <Mail className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-emerald-900 dark:text-emerald-400 font-bold text-lg">System Initialized</h3>
                                <p className="text-emerald-800/70 dark:text-emerald-500/70 text-sm leading-relaxed">
                                    A verification email has been sent to:
                                    <br />
                                    <strong className="text-emerald-900 dark:text-white font-semibold">{searchParams.get("email")}</strong>
                                </p>
                            </div>
                            <div className="pt-2">
                                <div className="px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-400 font-medium flex items-center gap-2 justify-center italic">
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    Activation required before first login
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Verification success banner */}
                    {verified && (
                        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 text-center animate-in fade-in slide-in-from-top-4 duration-300 space-y-3">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                            <div className="space-y-1">
                                <h3 className="text-emerald-900 dark:text-emerald-400 font-bold text-lg">Account Activated!</h3>
                                <p className="text-emerald-800/70 dark:text-emerald-500/70 text-sm">
                                    Your administrative credentials are now ready for use.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Verifying spinner */}
                    {verifying && (
                        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-center">
                            <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying your account...
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Error message */}
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 animate-in shake-1 duration-300">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                                <span className="text-red-600 dark:text-red-400 text-sm leading-relaxed">{error}</span>
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Identifier field */}
                            <div className="space-y-2">
                                <label htmlFor="identifier" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Username or Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <User className="w-full h-full" />
                                    </div>
                                    <input
                                        id="identifier"
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder="Enter your username or email"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password field */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Password
                                    </label>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Lock className="w-full h-full" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-[#0B0F19] hover:bg-[#1a202e] dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-black/5 dark:shadow-indigo-600/10 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign in to Dashboard</span>
                                    <ShieldCheck className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>


                    <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest pt-8">
                        Enterprise Grade Security & Compliance
                    </p>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect, useRef } from "react";
import { useParams, NavLink } from "react-router";
import { api } from "../lib/api";
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, Mail, ArrowRight } from "lucide-react";

export default function VerifyEmail() {
    const { token } = useParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    const verificationStarted = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("The verification link appears to be invalid or expired.");
            return;
        }

        if (verificationStarted.current) return;
        verificationStarted.current = true;

        api.verifyEmail(token)
            .then(async (res) => {
                const data = await res.json();
                if (res.ok) {
                    setStatus("success");
                    setMessage(data.message || "Your administrative account has been successfully activated.");
                } else {
                    setStatus("error");
                    setMessage(data.error || "We couldn't verify your email at this time.");
                }
            })
            .catch(() => {
                setStatus("error");
                setMessage("A connection error occurred during verification.");
            });
    }, [token]);

    return (
        <div className="flex min-h-screen w-full font-sans bg-white dark:bg-[#020617]">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex flex-col justify-between w-[55%] bg-[#0B0F19] p-16 text-white relative overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-[#0B0F19] to-[#0B0F19]" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Header / Logo */}
                <div className="relative z-10">
                    <img
                        src="/grcompli-logo.svg"
                        alt="GRCompli Logo"
                        className="w-28 h-28"
                    />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-xl space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Account Verification
                    </div>

                    <h1 className="text-5xl font-bold leading-tight tracking-tight text-white/95">
                        Securing Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-200">
                            Enterprise Access
                        </span>
                    </h1>

                    <p className="text-lg text-slate-400 leading-relaxed font-light">
                        Verification ensures that only authorized administrators can access the system's governance and compliance modules.
                    </p>
                </div>

                {/* Footer */}
                <div className="relative z-10 pt-8 border-t border-white/5">
                    <p className="text-sm text-slate-500 font-medium">
                        &copy; 2026 GRCompli Inc. Security Protocols Active.
                    </p>
                </div>
            </div>

            {/* Right Panel - Verification Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#020617] w-full border-l border-slate-100 dark:border-slate-800 relative">
                <div className="w-full max-w-[440px] mx-auto text-center space-y-10 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {status === "loading" && (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div className="p-5 bg-blue-500/10 rounded-full border border-blue-500/20">
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Verifying Credentials</h2>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Please wait while we validate your activation token...</p>
                            </div>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="space-y-8">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-30" />
                                    <div className="relative p-5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 px-4">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Activation Successful</h2>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {message} Your organization's root administrative account is now fully operational.
                                </p>
                            </div>

                            <div className="pt-4 px-2">
                                <NavLink
                                    to="/login"
                                    className="w-full h-14 bg-[#0B0F19] hover:bg-[#1a202e] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-black/5 dark:shadow-blue-600/10 transition-all duration-300 flex items-center justify-center gap-3 group px-8"
                                >
                                    <span>Proceed to Dashboard Access</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </NavLink>
                            </div>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-8">
                            <div className="flex justify-center">
                                <div className="p-5 bg-red-500/10 rounded-full border border-red-500/20">
                                    <AlertCircle className="w-10 h-10 text-red-500" />
                                </div>
                            </div>
                            <div className="space-y-3 px-4">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Verification Failed</h2>
                                <p className="text-red-500/90 dark:text-red-400/90 font-medium leading-relaxed">
                                    {message}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    Please ensure you are using the most recent link sent to your inbox.
                                </p>
                            </div>

                            <div className="pt-6 space-y-4 px-2">
                                <NavLink
                                    to="/setup"
                                    className="w-full h-14 bg-white dark:bg-[#020617] text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-300 flex items-center justify-center gap-3"
                                >
                                    <span>Restart Initialization</span>
                                </NavLink>
                                <NavLink
                                    to="/login"
                                    className="block text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-semibold transition-colors"
                                >
                                    Return to Secure Login
                                </NavLink>
                            </div>
                        </div>
                    )}

                    {/* Footer / Branding for Mobile */}
                    <div className="lg:hidden pt-8 flex items-center justify-center gap-2 opacity-40">
                        <img src="/grcompli-logo.svg" alt="Logo" className="w-8 h-8" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            GRCompli Security
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

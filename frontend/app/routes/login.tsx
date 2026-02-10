import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { api } from "../lib/api";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token && !verified) {
            handleVerifyEmail(token);
        }
    }, [searchParams]);

    const handleVerifyEmail = async (token: string) => {
        setVerifying(true);
        try {
            const res = await api.verifyEmail(token);
            const data = await res.json();
            if (res.ok) {
                setVerified(true);
                if (data.username) {
                    setUsername(data.username);
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
            const res = await api.login({ username, password });
            if (res.ok) {
                const redirectTo = searchParams.get("redirectTo") || "/dashboard";
                navigate(redirectTo);
            } else {
                const data = await res.json();
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 font-display">Welcome Back</h1>
                    <p className="text-zinc-400">Sign in to your account to continue</p>
                </div>

                {verified && (
                    <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="text-3xl mb-2">🎉</div>
                        <h3 className="text-emerald-400 font-bold mb-1">Congratulations!</h3>
                        <p className="text-emerald-500/80 text-sm">
                            Your email is verified. Now login to your account.
                        </p>
                    </div>
                )}

                {verifying && (
                    <div className="mb-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                        <div className="flex items-center justify-center gap-3 text-blue-400 italic">
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            Verifying your account...
                        </div>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98]"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                    <p className="text-zinc-500 text-sm">
                        Don't have an account?{" "}
                        <a href="/signup" className="text-blue-400 hover:text-blue-300">
                            Sign up here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

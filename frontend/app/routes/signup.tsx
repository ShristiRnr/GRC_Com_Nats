import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { api } from "../lib/api";

export default function Signup() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.signup(formData);
            if (res.ok) {
                setSubmitted(true);
            } else {
                const data = await res.json();
                setError(data.error || "Signup failed");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted p-4">
                <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
                    <div className="text-6xl mb-4">📧</div>
                    <h1 className="text-2xl font-bold text-white mb-3">Check Your Email!</h1>
                    <p className="text-zinc-400 mb-6">
                        We've sent a verification link to <strong className="text-white">{formData.email}</strong>.
                        Please check your inbox and click the link to verify your account.
                    </p>
                    <p className="text-sm text-zinc-500 mb-6">
                        Didn't receive the email? Check your spam folder or{" "}
                        <button
                            onClick={async () => {
                                await api.resendVerification(formData.email);
                                alert("Verification email resent!");
                            }}
                            className="text-blue-400 hover:text-blue-300 underline"
                        >
                            resend verification email
                        </button>
                    </p>
                    <Link
                        to="/login"
                        className="inline-block text-blue-400 hover:text-blue-300"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-zinc-400">Join GRC Compliance System</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
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
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            required
                            minLength={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            required
                            minLength={8}
                        />
                        <p className="text-xs text-zinc-500 mt-1">At least 8 characters</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98]"
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                    <p className="text-zinc-500 text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-400 hover:text-blue-300">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

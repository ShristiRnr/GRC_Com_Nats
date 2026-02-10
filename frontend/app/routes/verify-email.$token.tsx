import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { api } from "../lib/api";

export default function VerifyEmail() {
    const { token } = useParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link");
            return;
        }

        api.verifyEmail(token)
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    setStatus("success");
                    setMessage(data.message || "Email verified successfully!");
                } else {
                    const data = await res.json();
                    setStatus("error");
                    setMessage(data.error || "Verification failed");
                }
            })
            .catch(() => {
                setStatus("error");
                setMessage("An unexpected error occurred");
            });
    }, [token]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">⏳</div>
                    <p className="text-white text-xl">Verifying your email...</p>
                </div>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
                <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-3xl font-bold text-white mb-3">Email Verified!</h1>
                    <p className="text-zinc-400 mb-8">{message}</p>
                    <Link
                        to="/login"
                        className="inline-block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all transform active:scale-[0.98]"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl text-center">
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-3xl font-bold text-white mb-3">Verification Failed</h1>
                <p className="text-zinc-400 mb-8">{message}</p>
                <div className="space-y-3">
                    <Link
                        to="/signup"
                        className="inline-block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all transform active:scale-[0.98]"
                    >
                        Try Signing Up Again
                    </Link>
                    <Link
                        to="/login"
                        className="inline-block w-full text-blue-400 hover:text-blue-300"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

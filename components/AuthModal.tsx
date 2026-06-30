"use client";

import { useState } from "react";
import type { AuthState } from "@/lib/useAuth";

export default function AuthModal({
  auth,
  onClose,
}: {
  auth: AuthState;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setInfo(null);
    if (!email || password.length < 6) {
      setError("Enter an email and a password (6+ characters).");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        await auth.signIn(email, password);
        onClose();
      } else {
        const { needsConfirm } = await auth.signUp(email, password);
        if (needsConfirm) {
          setInfo("Check your email to confirm your account, then sign in.");
          setMode("signin");
        } else {
          onClose();
        }
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-sm rounded-3xl p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold">
          {mode === "signin" ? "Welcome back" : "Create your "}
          {mode === "signup" && <span className="grad-text">account</span>}
        </h2>
        <p className="mt-1 text-sm text-white/55">
          {mode === "signin"
            ? "Sign in to sync your courses across devices."
            : "Your courses are saved to your account and follow you anywhere."}
        </p>

        <div className="mt-6 space-y-3">
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm outline-none transition focus:border-accent/60"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Password"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm outline-none transition focus:border-accent/60"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {info && <p className="mt-3 text-sm text-accent2">{info}</p>}

        <button
          onClick={submit}
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-accent to-glow py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
        >
          {loading
            ? "Please wait…"
            : mode === "signin"
            ? "Sign in"
            : "Create account"}
        </button>

        <button
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setError(null);
            setInfo(null);
          }}
          className="mt-4 w-full text-center text-xs text-white/50 transition hover:text-white"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Step = "email" | "code";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/profile";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok && !cancelled) {
          router.replace(nextPath);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, nextPath]);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDevCode(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string; devCode?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not send code.");
      }
      setStep("code");
      if (data.devCode) setDevCode(data.devCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Invalid code.");
      }
      router.replace(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return <p className="text-sm text-zinc-500">Checking session…</p>;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">BetterDev member</p>
      <h1 className="mt-3 text-2xl font-black text-white">{step === "email" ? "Log in" : "Enter your code"}</h1>
      <p className="mt-3 text-sm text-zinc-400">
        {step === "email"
          ? "Use the email you registered with. We will send a 6-digit code — no password needed."
          : `We sent a code to ${email}. It expires in 10 minutes.`}
      </p>

      {step === "email" ? (
        <form onSubmit={sendCode} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="text-xs font-bold text-zinc-400">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-sky/40"
              placeholder="you@example.com"
            />
          </div>
          {error && (
            <p className="rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-3 text-sm text-brand-pink">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send login code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="mt-6 space-y-4">
          {devCode ? (
            <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
              Dev mode code: <span className="font-mono font-bold">{devCode}</span>
            </p>
          ) : null}
          <div>
            <label htmlFor="login-code" className="text-xs font-bold text-zinc-400">
              6-digit code
            </label>
            <input
              id="login-code"
              type="text"
              inputMode="numeric"
              required
              autoFocus
              maxLength={6}
              pattern="\d{6}"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-center font-mono text-lg tracking-[0.35em] text-white outline-none focus:border-brand-sky/40"
              placeholder="000000"
            />
          </div>
          {error && (
            <p className="rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-3 text-sm text-brand-pink">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="w-full rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white disabled:opacity-60"
          >
            {submitting ? "Verifying…" : "Log in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
              setDevCode(null);
            }}
            className="w-full text-sm font-bold text-zinc-500 transition hover:text-white"
          >
            Use a different email
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-zinc-600">
        Not registered yet?{" "}
        <Link href="/join" className="font-bold text-brand-sky hover:text-white">
          Join BetterDev
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-md">
        <Suspense fallback={<div className="text-zinc-500">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import {
  readStoredOrganizerSecret,
  writeStoredOrganizerSecret,
} from "@/lib/organizer-secret-storage";

export default function OrganizerCheckinPage() {
  const params = useParams();
  const meetupId = typeof params.meetupId === "string" ? params.meetupId : "";

  const [secret, setSecret] = useState("");
  const [checkinUrl, setCheckinUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredOrganizerSecret();
    if (stored) setSecret(stored);
    setReady(true);
  }, []);

  const createSession = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const trimmed = secret.trim();
      if (!trimmed) throw new Error("Organizer key is required.");
      writeStoredOrganizerSecret(trimmed);

      const res = await fetch("/api/meetups/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetupId, secret: trimmed }),
      });
      const data = (await res.json()) as { error?: string; checkinUrl?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not create session.");
      setCheckinUrl(data.checkinUrl ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create session.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-dvh bg-black px-5 py-16 text-white">
        <div className="mx-auto max-w-lg text-zinc-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-lg">
        <Link href="/organizer/create" className="text-xs font-bold text-brand-sky transition hover:text-white">
          ← Back to create page
        </Link>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">Organizer</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Meetup check-in QR</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Generate a signed check-in link for{" "}
          <span className="font-bold text-white">{meetupId}</span>.
        </p>

        {!checkinUrl ? (
          <form
            onSubmit={createSession}
            className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.035] p-6"
          >
            <div>
              <label htmlFor="organizer-secret" className="text-xs font-bold text-zinc-400">
                Organizer key
              </label>
              <input
                id="organizer-secret"
                type="password"
                required
                autoComplete="off"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-sky/40"
                placeholder="org_…"
              />
            </div>
            {error ? (
              <p className="rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-3 text-sm text-brand-pink">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating…" : "Generate QR code"}
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white p-8 text-center text-black">
            <QRCodeSVG value={checkinUrl} size={240} level="M" className="mx-auto" />
            <p className="mt-6 break-all text-left text-xs text-zinc-600">{checkinUrl}</p>
            <p className="mt-4 text-sm font-bold text-zinc-800">
              Valid for 4 hours · display at venue entrance
            </p>
            <button
              type="button"
              onClick={() => setCheckinUrl(null)}
              className="mt-6 text-sm font-bold text-brand-purple transition hover:opacity-80"
            >
              Regenerate QR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

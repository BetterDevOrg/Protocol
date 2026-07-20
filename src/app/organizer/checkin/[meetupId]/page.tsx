"use client";

import { getPublicEventMeetupId } from "@/lib/event-config";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export default function OrganizerCheckinPage() {
  const params = useParams();
  const meetupId =
    typeof params.meetupId === "string" ? params.meetupId : getPublicEventMeetupId();

  const [secret, setSecret] = useState("");
  const [checkinUrl, setCheckinUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/meetups/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, meetupId }),
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

  return (
    <div className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-lg">
        <Link href="/organizer" className="text-xs font-bold text-brand-sky transition hover:text-white">
          ← Back to Organizer
        </Link>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">Organizer</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Meetup check-in QR</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Generate a signed check-in link for{" "}
          <span className="font-bold text-white">{meetupId}</span>. Attendees scan the QR to verify attendance
          on-chain (+20 reputation).
        </p>

        {!checkinUrl ? (
          <form
            onSubmit={createSession}
            className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.035] p-6"
          >
            <div>
              <label htmlFor="organizer-secret" className="text-xs font-bold text-zinc-400">
                Organizer secret
              </label>
              <input
                id="organizer-secret"
                type="password"
                required
                autoComplete="off"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-sky/40"
                placeholder="ORGANIZER_SESSION_SECRET"
              />
              <p className="mt-2 text-[11px] text-zinc-600">Set in your server env as ORGANIZER_SESSION_SECRET.</p>
            </div>
            {error && (
              <p className="rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-3 text-sm text-brand-pink">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white shadow-[0_0_36px_-14px_rgba(233,30,140,0.95)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
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
              onClick={() => {
                setCheckinUrl(null);
                setSecret("");
              }}
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

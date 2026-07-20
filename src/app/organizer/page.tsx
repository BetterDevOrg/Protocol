"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";
import { slugifyFromName } from "@/lib/meetup-slug";

type CreateMeetupResponse = {
  error?: string;
  meetupId?: string;
  slug?: string;
  name?: string;
  city?: string;
  created?: boolean;
  txHash?: string;
  metadataURI?: string;
  checkinUrl?: string;
};

export default function OrganizerPage() {
  const [secret, setSecret] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateMeetupResponse | null>(null);

  const suggestedSlug = useMemo(() => slugifyFromName(name), [name]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugifyFromName(value));
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/meetups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, slug, name, city }),
      });
      const data = (await res.json()) as CreateMeetupResponse;
      if (!res.ok) throw new Error(data.error ?? "Could not create event.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create event.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setSecret("");
    setName("");
    setSlug("");
    setSlugTouched(false);
    setCity("");
    setError(null);
  };

  return (
    <div className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-lg">
        <Link href="/meetup" className="text-xs font-bold text-brand-sky transition hover:text-white">
          ← Back to Passport
        </Link>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">Organizer</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Create meetup event</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Register a new event on-chain, then display the check-in QR at the venue. Attendees scan it to verify
          attendance (+20 reputation).
        </p>

        {!result?.checkinUrl ? (
          <form
            onSubmit={createEvent}
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
                placeholder="Your ORGANIZER_SESSION_SECRET value"
              />
            </div>

            <div>
              <label htmlFor="event-name" className="text-xs font-bold text-zinc-400">
                Event name
              </label>
              <input
                id="event-name"
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-sky/40"
                placeholder="BetterDev Lagos Meetup"
              />
            </div>

            <div>
              <label htmlFor="event-slug" className="text-xs font-bold text-zinc-400">
                Event slug
              </label>
              <input
                id="event-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value.toLowerCase());
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-sky/40"
                placeholder={suggestedSlug || "betterdev-lagos-001"}
              />
              <p className="mt-2 text-[11px] text-zinc-600">
                Lowercase letters, numbers, and hyphens only. Used in check-in URLs and on-chain meetup ID.
              </p>
            </div>

            <div>
              <label htmlFor="event-city" className="text-xs font-bold text-zinc-400">
                City
              </label>
              <input
                id="event-city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-sky/40"
                placeholder="Lagos"
              />
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
              {loading ? "Creating on-chain…" : "Create event & generate QR"}
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
              <p className="font-bold text-emerald-100">{result.name}</p>
              <p className="mt-1 text-emerald-200/90">
                {result.city} · slug <span className="font-mono">{result.slug}</span>
              </p>
              <p className="mt-2 text-xs text-emerald-200/80">
                {result.created
                  ? "Registered on-chain."
                  : "Already registered on-chain — QR refreshed for this session."}
                {result.txHash ? (
                  <>
                    {" "}
                    Tx:{" "}
                    <span className="break-all font-mono text-[11px]">{result.txHash}</span>
                  </>
                ) : null}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white p-8 text-center text-black">
              <QRCodeSVG value={result.checkinUrl} size={240} level="M" className="mx-auto" />
              <p className="mt-6 break-all text-left text-xs text-zinc-600">{result.checkinUrl}</p>
              <p className="mt-4 text-sm font-bold text-zinc-800">
                Valid for 4 hours · display at venue entrance
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm font-bold">
              <Link
                href={`/organizer/checkin/${result.slug}`}
                className="text-brand-sky transition hover:text-white"
              >
                Regenerate QR later →
              </Link>
              <button
                type="button"
                onClick={resetForm}
                className="text-zinc-500 transition hover:text-white"
              >
                Create another event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

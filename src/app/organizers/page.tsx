"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Organizer } from "@/types/organizer";

// Helper map for country flag badges
const COUNTRY_FLAGS: Record<string, string> = {
  Nigeria: "🇳🇬",
  India: "🇮🇳",
  "United States": "🇺🇸",
  USA: "🇺🇸",
  UK: "🇬🇧",
  "United Kingdom": "🇬🇧",
  Canada: "🇨🇦",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Spain: "🇪🇸",
  Brazil: "🇧🇷",
  Japan: "🇯🇵",
  Australia: "🇦🇺",
  Kenya: "🇰🇪",
  Ghana: "🇬🇭",
  "South Africa": "🇿🇦",
};

// Graceful fallback helper function
function getCountryBadge(country?: string | null) {
  if (!country) return null;
  const trimmed = country.trim();
  return COUNTRY_FLAGS[trimmed] || "🌐";
}

export default function OrganizersDirectoryPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/organizers", { cache: "no-store" });
        const data = (await res.json()) as { organizers?: Organizer[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Could not load organizers.");
        if (!cancelled) {
          setOrganizers(data.organizers ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load organizers.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  return (
    <div className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-xs font-bold text-brand-sky transition hover:text-white">
          ← Back to home
        </Link>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">
          City organizers
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">BetterDev City Co-Leads</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          City organizers host local meetups, run check-ins, and grow the builder community in their city.
        </p>

        {loading && !error ? (
          <p className="mt-10 text-zinc-500">Loading organizers…</p>
        ) : error ? (
          <div className="mt-10 rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-4">
            <p className="text-sm text-brand-pink">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              disabled={loading}
              className="mt-4 rounded-xl bg-brand-sash-diag px-5 py-2.5 text-sm font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Trying again…" : "Try again"}
            </button>
          </div>
        ) : organizers.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.035] p-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-brand-sky/20 bg-brand-sky/10">
              <svg
                className="size-6 text-brand-sky"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 21s-7-5.686-7-11a7 7 0 1 1 14 0c0 5.314-7 11-7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>
            <p className="mt-5 text-lg font-black text-white">No active city organizers yet</p>
            <p className="mt-2 max-w-sm text-sm text-zinc-400">
              Be the first to bring BetterDev to your city and help other developers connect locally.
            </p>
            <Link
              href="/organizer"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-sash-diag px-6 py-3 text-sm font-black text-white transition hover:opacity-95"
            >
              Apply to become a city organizer →
            </Link>
          </div>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {organizers.map((organizer) => (
              <li key={organizer.organizerId}>
                <Link
                  href={`/organizers/${organizer.organizerId}`}
                  className="block rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-brand-sky/30 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-black text-white">{organizer.fullName || "City organizer"}</p>
                    {organizer.country && (
                      <span
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-zinc-300"
                        title={organizer.country}
                      >
                        <span aria-hidden="true">{getCountryBadge(organizer.country)}</span>
                        <span className="text-[11px] text-zinc-400">{organizer.country}</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">
                    {organizer.city || "Unknown City"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-zinc-500">
                    <span className="font-mono text-brand-sky">{organizer.organizerId}</span>
                    <span>{organizer.eventsHosted} events</span>
                    <span>{organizer.organizerReputation} rep</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 text-center text-sm text-zinc-500">
          Want to host in your city?{" "}
          <Link href="/organizer" className="font-bold text-brand-sky hover:text-white">
            Apply as a city organizer
          </Link>
        </p>
      </div>
    </div>
  );
}

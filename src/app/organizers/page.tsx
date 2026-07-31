"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Organizer } from "@/types/organizer";

export default function OrganizersDirectoryPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/organizers", { cache: "no-store" });
        const data = (await res.json()) as { organizers?: Organizer[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Could not load organizers.");
        if (!cancelled) setOrganizers(data.organizers ?? []);
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
  }, []);

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

        {loading ? (
          <p className="mt-10 text-zinc-500">Loading organizers…</p>
        ) : error ? (
          <p className="mt-10 rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-4 text-sm text-brand-pink">
            {error}
          </p>
        ) : organizers.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center">
            <p className="text-zinc-400">No active city organizers yet.</p>
            <Link
              href="/organizer"
              className="mt-4 inline-block text-sm font-bold text-brand-sky transition hover:text-white"
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
                  <p className="font-black text-white">{organizer.fullName || "City organizer"}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {organizer.city}
                    {organizer.country ? `, ${organizer.country}` : ""}
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

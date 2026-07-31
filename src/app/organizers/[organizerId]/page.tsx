"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { GoogleSheetsEventRecord } from "@/lib/google-sheets/types";
import type { Organizer } from "@/types/organizer";

function formatEventDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function OrganizerProfilePage() {
  const params = useParams();
  const organizerId = typeof params.organizerId === "string" ? params.organizerId : "";

  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [events, setEvents] = useState<GoogleSheetsEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizerId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/organizers/${encodeURIComponent(organizerId)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as {
          organizer?: Organizer;
          events?: GoogleSheetsEventRecord[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Organizer not found.");
        if (!cancelled) {
          setOrganizer(data.organizer ?? null);
          setEvents(data.events ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load organizer.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [organizerId]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-black px-5 py-16 text-white">
        <div className="mx-auto max-w-lg text-zinc-500">Loading organizer…</div>
      </div>
    );
  }

  if (error || !organizer) {
    return (
      <div className="min-h-dvh bg-black px-5 py-16 text-white">
        <div className="mx-auto max-w-lg">
          <Link href="/organizers" className="text-xs font-bold text-brand-sky transition hover:text-white">
            ← All organizers
          </Link>
          <p className="mt-10 rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-4 text-sm text-brand-pink">
            {error ?? "Organizer not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-lg">
        <Link href="/organizers" className="text-xs font-bold text-brand-sky transition hover:text-white">
          ← All organizers
        </Link>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">City co-lead</p>
          <h1 className="mt-3 text-2xl font-black">{organizer.fullName || "City organizer"}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {organizer.city}
            {organizer.country ? `, ${organizer.country}` : ""}
          </p>

          {organizer.bio ? <p className="mt-4 text-sm leading-relaxed text-zinc-300">{organizer.bio}</p> : null}

          <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-black/30 p-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Organizer ID</span>
              <span className="font-mono font-bold text-brand-sky">{organizer.organizerId}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Community ID</span>
              <span className="font-mono font-bold text-white">{organizer.communityId}</span>
            </div>
            {organizer.xUsername ? (
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">X</span>
                <span className="font-bold text-white">@{organizer.xUsername.replace(/^@/, "")}</span>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Events hosted</span>
              <span className="font-bold text-white">{organizer.eventsHosted}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
              <span className="text-zinc-500">Organizer reputation</span>
              <span className="text-xl font-black text-white">{organizer.organizerReputation}</span>
            </div>
            {organizer.onChainReputation !== null && organizer.onChainReputation !== undefined ? (
              <p className="text-[11px] text-zinc-600">
                {organizer.onChainReputation > 0
                  ? `${organizer.onChainReputation} verified on-chain`
                  : "On-chain registry active"}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Events hosted</h2>
          {events.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600">No events recorded yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {events.map((event) => (
                <li
                  key={event.slug}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm"
                >
                  <p className="font-bold text-white">{event.name}</p>
                  <p className="mt-1 text-zinc-500">
                    {event.city} · {formatEventDate(event.createdAt)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-zinc-600">{event.slug}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

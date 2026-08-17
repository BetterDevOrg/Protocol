"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  COMMUNITY_ID_PREFIX,
  formatCommunityIdFromNumber,
  sanitizeMemberNumberInput,
} from "@/lib/community-id";
import type { StoredBuilderCircle } from "@/lib/builder-circle-config";
import { Spinner } from "@/components/ui/spinner";

function BuilderCirclesView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const meetupId = typeof params.meetupId === "string" ? params.meetupId : "";
  const initialCommunityId = searchParams.get("communityId")?.trim().toUpperCase() ?? "";

  const [memberNumber, setMemberNumber] = useState("");
  const [communityId, setCommunityId] = useState(initialCommunityId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigned, setAssigned] = useState(false);
  const [circles, setCircles] = useState<StoredBuilderCircle[]>([]);
  const [myCircle, setMyCircle] = useState<StoredBuilderCircle | null>(null);
  const [meta, setMeta] = useState<{ city: string; attendeeCount: number; groupSize: number } | null>(null);

  const loadCircles = async (lookupCommunityId?: string) => {
    const query = lookupCommunityId
      ? `?communityId=${encodeURIComponent(lookupCommunityId)}`
      : "";
    const res = await fetch(`/api/meetups/${encodeURIComponent(meetupId)}/builder-circles${query}`, {
      cache: "no-store",
    });
    const data = (await res.json()) as {
      assigned?: boolean;
      assignment?: {
        city: string;
        attendeeCount: number;
        groupSize: number;
        circles: StoredBuilderCircle[];
      };
      myCircle?: StoredBuilderCircle | null;
      error?: string;
    };

    if (!res.ok) throw new Error(data.error ?? "Could not load groups.");
    setAssigned(Boolean(data.assigned));
    if (data.assignment) {
      setCircles(data.assignment.circles);
      setMeta({
        city: data.assignment.city,
        attendeeCount: data.assignment.attendeeCount,
        groupSize: data.assignment.groupSize,
      });
    }
    setMyCircle(data.myCircle ?? null);
  };

  useEffect(() => {
    if (!meetupId) return;
    let cancelled = false;
    (async () => {
      try {
        await loadCircles(initialCommunityId || undefined);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load groups.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [meetupId, initialCommunityId]);

  const lookupMyGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const id = formatCommunityIdFromNumber(memberNumber);
      setCommunityId(id);
      await loadCircles(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find your group.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-zinc-500">Loading Builder Circles…</div>;
  }

  return (
    <div>
      <Link href={`/meetup/${params.meetupId}`} className="text-xs font-bold text-brand-sky transition hover:text-white">
        ← Back to RSVP
      </Link>
      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">Builder Circles</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight">Your meetup group</h1>
      <p className="mt-3 text-sm text-zinc-400">
        Small groups assigned fairly so you meet engineers you would not normally talk to.
      </p>

      {!assigned ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-6 text-sm text-zinc-400">
          Builder Circles are assigned before the event. RSVP now to be included, then check back after the
          organizer runs matching.
          <Link
            href={`/meetup/${meetupId}`}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-brand-sash-diag px-5 py-3 font-black text-white transition hover:brightness-110 sm:w-auto"
          >
            RSVP for this meetup →
          </Link>
        </div>
      ) : (
        <>
          {meta ? (
            <p className="mt-4 text-xs text-zinc-600">
              {meta.city} · {meta.attendeeCount} attendees · ~{meta.groupSize} per group
            </p>
          ) : null}

          {!myCircle && !communityId ? (
            <form onSubmit={lookupMyGroup} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <p className="text-sm text-zinc-400">Enter your member number to find your group.</p>
              <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black focus-within:border-brand-sky/40">
                <span className="flex items-center border-r border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-sm font-bold text-brand-sky">
                  {COMMUNITY_ID_PREFIX}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={4}
                  value={memberNumber}
                  onChange={(e) => setMemberNumber(sanitizeMemberNumberInput(e.target.value))}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm text-white outline-none"
                  placeholder="0001"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white"
              >
                Find my group
              </button>
            </form>
          ) : null}

          {myCircle ? (
            <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">Your table</p>
              <h2 className="mt-2 text-2xl font-black text-white">{myCircle.id}</h2>
              <ul className="mt-6 space-y-3">
                {myCircle.members.map((member) => (
                  <li
                    key={member.communityId}
                    className={`flex justify-between gap-3 rounded-xl border p-3 text-sm ${
                      member.communityId === communityId
                        ? "border-brand-sky/30 bg-brand-sky/10"
                        : "border-white/10 bg-black/30"
                    }`}
                  >
                    <span className="font-bold text-white">{member.fullName}</span>
                    <span className="text-zinc-500">{member.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : communityId ? (
            <p className="mt-8 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              No group found for {communityId}. RSVP for the meetup or confirm matching has run.
            </p>
          ) : null}

          <div className="mt-10">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">All groups</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {circles.map((circle) => (
                <div key={circle.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="text-sm font-black text-white">{circle.id}</p>
                  <ul className="mt-3 space-y-1 text-xs text-zinc-400">
                    {circle.members.map((member) => (
                      <li key={member.communityId}>{member.fullName}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {error ? (
        <p className="mt-6 rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-3 text-sm text-brand-pink">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function MeetupBuilderCirclesPage() {
  return (
    <div className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <Suspense
          fallback={
            <div className="flex items-center justify-center gap-2 text-zinc-500" role="status">
              <Spinner className="h-4 w-4" />
              <span>Loading…</span>
            </div>
          }
        >
          <BuilderCirclesView />
        </Suspense>
      </div>
    </div>
  );
}

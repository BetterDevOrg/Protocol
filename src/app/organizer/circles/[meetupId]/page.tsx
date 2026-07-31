"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MIN_BUILDER_CIRCLE_PARTICIPANTS,
  type BuilderCirclePoolMode,
} from "@/lib/builder-circle-config";
import type { StoredBuilderCircle } from "@/lib/builder-circle-config";
import { readStoredOrganizerSecret } from "@/lib/organizer-secret-storage";

type HybridStats = {
  poolMode: BuilderCirclePoolMode;
  rsvpCount: number;
  cityMemberCount: number;
  hybridPoolCount: number;
  venueCheckins: number;
  eligibleCount: number;
  eventCity: string;
  minRequired: number;
};

type EligibilityResponse = {
  event?: { slug: string; name: string; city: string };
  stats?: HybridStats;
  poolMode?: BuilderCirclePoolMode;
  ready?: boolean;
  error?: string;
};

type AssignmentResponse = {
  ok?: boolean;
  assignment?: {
    attendeeCount: number;
    groupSize: number;
    vrfFulfilled: boolean;
    circles: StoredBuilderCircle[];
  };
  vrfPending?: boolean;
  emails?: { sent: number; logged: number; skipped: number };
  error?: string;
  stats?: HybridStats;
};

const POOL_MODES: { value: BuilderCirclePoolMode; label: string; description: string }[] = [
  {
    value: "hybrid",
    label: "Hybrid",
    description: "RSVPs + city members (deduped)",
  },
  {
    value: "rsvp",
    label: "RSVP only",
    description: "Members who RSVP'd for this event",
  },
  {
    value: "city",
    label: "City only",
    description: "All members in the event city",
  },
];

export default function OrganizerBuilderCirclesPage() {
  const params = useParams();
  const meetupId = typeof params.meetupId === "string" ? params.meetupId : "";

  const [secret, setSecret] = useState("");
  const [poolMode, setPoolMode] = useState<BuilderCirclePoolMode>("hybrid");
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [assignment, setAssignment] = useState<AssignmentResponse["assignment"] | null>(null);
  const [emailSummary, setEmailSummary] = useState<AssignmentResponse["emails"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestVrf, setRequestVrf] = useState(true);

  const loadData = async (organizerSecret: string, mode: BuilderCirclePoolMode) => {
    const secretParam = encodeURIComponent(organizerSecret);
    const poolParam = encodeURIComponent(mode);
    const [eligibilityRes, assignmentRes] = await Promise.all([
      fetch(
        `/api/meetups/${encodeURIComponent(meetupId)}/builder-circles?eligibility=true&secret=${secretParam}&poolMode=${poolParam}`,
        { cache: "no-store" },
      ),
      fetch(`/api/meetups/${encodeURIComponent(meetupId)}/builder-circles`, { cache: "no-store" }),
    ]);

    if (eligibilityRes.status === 401) {
      throw new Error("Invalid organizer key.");
    }

    const eligibilityData = (await eligibilityRes.json()) as EligibilityResponse;
    if (!eligibilityRes.ok) {
      throw new Error(eligibilityData.error ?? "Could not load eligibility.");
    }
    setEligibility(eligibilityData);

    const assignmentData = (await assignmentRes.json()) as {
      assigned?: boolean;
      assignment?: AssignmentResponse["assignment"];
    };
    if (assignmentData.assigned && assignmentData.assignment) {
      setAssignment(assignmentData.assignment);
    }
  };

  useEffect(() => {
    if (!meetupId) return;
    const stored = readStoredOrganizerSecret();
    if (stored) setSecret(stored);
    if (!stored) setLoading(false);
  }, [meetupId]);

  useEffect(() => {
    if (!meetupId || !secret.trim()) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        await loadData(secret.trim(), poolMode);
        if (!cancelled) setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load Builder Circles.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [meetupId, secret, poolMode]);

  const runMatching = async () => {
    setError(null);
    setRunning(true);
    setEmailSummary(null);
    try {
      const trimmed = secret.trim();
      if (!trimmed) throw new Error("Organizer key is required.");

      const res = await fetch(`/api/meetups/${encodeURIComponent(meetupId)}/builder-circles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestVrf, secret: trimmed, poolMode }),
      });
      const data = (await res.json()) as AssignmentResponse;
      if (!res.ok) {
        throw new Error(data.error ?? "Could not assign Builder Circles.");
      }
      setAssignment(data.assignment ?? null);
      setEmailSummary(data.emails ?? null);
      await loadData(trimmed, poolMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not assign Builder Circles.");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-black px-5 py-16 text-white">
        <div className="mx-auto max-w-lg text-zinc-500">Loading Builder Circles…</div>
      </div>
    );
  }

  const stats = eligibility?.stats;
  const remaining = stats ? Math.max(0, stats.minRequired - stats.eligibleCount) : 0;

  return (
    <div className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-lg">
        <Link href="/organizer/create" className="text-xs font-bold text-brand-sky transition hover:text-white">
          ← Back to create page
        </Link>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">
          Builder Circles
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          {eligibility?.event?.name ?? meetupId}
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          Match devs into small groups <span className="font-bold text-white">before the event</span>.
          QR check-in at the venue is for attendance only. Minimum {MIN_BUILDER_CIRCLE_PARTICIPANTS}{" "}
          participants in{" "}
          <span className="font-bold text-white">{eligibility?.event?.city ?? "this city"}</span>.
        </p>

        {!secret.trim() ? (
          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-6 text-sm text-amber-100">
            <p className="font-bold">Organizer key required</p>
            <p className="mt-2">
              Unlock{" "}
              <Link href="/organizer/create" className="font-bold text-brand-sky hover:text-white">
                /organizer/create
              </Link>{" "}
              with your private key first, then return here.
            </p>
          </div>
        ) : null}

        {stats ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Participant pool</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">RSVPs</p>
                  <p className="mt-1 text-xl font-black text-brand-sky">{stats.rsvpCount}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">City members</p>
                  <p className="mt-1 text-xl font-black">{stats.cityMemberCount}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Hybrid pool</p>
                  <p className="mt-1 text-xl font-black">{stats.hybridPoolCount}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Selected pool</p>
                  <p className="mt-1 text-xl font-black text-emerald-300">{stats.eligibleCount}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-zinc-500">Venue check-ins (attendance only)</p>
                  <p className="mt-1 font-bold text-zinc-400">{stats.venueCheckins}</p>
                </div>
              </div>
              {!eligibility?.ready ? (
                <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-100">
                  Need {remaining} more in the selected pool before matching can run.
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Matching mode</p>
              <div className="mt-4 space-y-2">
                {POOL_MODES.map((mode) => (
                  <label
                    key={mode.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                      poolMode === mode.value
                        ? "border-brand-sky/40 bg-brand-sky/10"
                        : "border-white/10 bg-black/20 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="poolMode"
                      value={mode.value}
                      checked={poolMode === mode.value}
                      onChange={() => setPoolMode(mode.value)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-bold text-white">{mode.label}</span>
                      <span className="mt-0.5 block text-xs text-zinc-500">{mode.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-zinc-600">
                Share the RSVP link:{" "}
                <Link
                  href={`/meetup/${meetupId}`}
                  className="font-mono text-brand-sky hover:text-white"
                >
                  /meetup/{meetupId}
                </Link>
              </p>
            </div>
          </div>
        ) : null}

        {!assignment ? (
          <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={requestVrf}
                onChange={(e) => setRequestVrf(e.target.checked)}
                className="rounded border-white/20"
              />
              Request Chainlink VRF seed (falls back to server random if pending)
            </label>
            {error ? (
              <p className="rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-3 text-sm text-brand-pink">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              onClick={runMatching}
              disabled={running || !eligibility?.ready}
              className="w-full rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? "Assigning groups…" : "Run Builder Circle matching"}
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
              <p className="font-bold text-emerald-100">Groups assigned</p>
              <p className="mt-1">
                {assignment.attendeeCount} participants · {assignment.circles.length} groups ·{" "}
                {assignment.vrfFulfilled ? "VRF verified seed" : "server random seed"}
              </p>
              {emailSummary ? (
                <p className="mt-2 text-xs text-emerald-200/80">
                  Emails: {emailSummary.sent} sent
                  {emailSummary.logged ? `, ${emailSummary.logged} logged to console` : ""}
                  {emailSummary.skipped ? `, ${emailSummary.skipped} skipped (no email)` : ""}
                </p>
              ) : null}
              <Link
                href={`/meetup/${meetupId}/circles`}
                className="mt-3 inline-block text-xs font-bold text-brand-sky hover:text-white"
              >
                Attendee view →
              </Link>
            </div>

            <div className="grid gap-4">
              {assignment.circles.map((circle) => (
                <div key={circle.id} className="rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-sm font-black text-white">{circle.id}</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {circle.members.map((member) => (
                      <li key={member.communityId} className="flex justify-between gap-3">
                        <span className="font-bold text-zinc-300">{member.fullName}</span>
                        <span className="font-mono text-xs text-zinc-600">{member.communityId}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={runMatching}
              disabled={running || !eligibility?.ready}
              className="text-sm font-bold text-zinc-500 transition hover:text-white disabled:opacity-60"
            >
              {running ? "Re-running…" : "Re-run matching"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

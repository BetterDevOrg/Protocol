"use client";

import {
  COMMUNITY_ID_PREFIX,
  formatCommunityIdFromNumber,
  sanitizeMemberNumberInput,
  validateMemberNumberInput,
} from "@/lib/community-id";
import { transactionExplorerUrl } from "@/lib/contracts";
import { DEMO_MEETUP } from "@/lib/passport";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type CheckinSuccess = {
  communityId: string;
  memberDisplay: string;
  fullName: string;
  city: string;
  country: string;
  meetupId: string;
  meetupName: string;
  meetupCity?: string;
  reputation: number;
  pointsAwarded: number;
  attendanceTx: string;
  alreadyCheckedIn: boolean;
};

function CheckinForm() {
  const searchParams = useSearchParams();
  const meetupId = searchParams.get("meetup") ?? "";
  const token = searchParams.get("token") ?? "";

  const [memberNumber, setMemberNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CheckinSuccess | null>(null);

  if (!meetupId || !token) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center">
        <h1 className="text-2xl font-black text-white">Meetup check-in</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          Scan the QR code at the event to open your personal check-in link. If you are not registered yet,{" "}
          <Link href="/join" className="font-bold text-brand-sky hover:text-white">
            join BetterDev first
          </Link>
          .
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const memberNumberError = validateMemberNumberInput(memberNumber);
    if (memberNumberError) {
      setError(memberNumberError);
      return;
    }

    const communityId = formatCommunityIdFromNumber(memberNumber);
    setSubmitting(true);
    try {
      const res = await fetch("/api/meetups/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId, token, meetupId }),
      });
      const data = (await res.json()) as CheckinSuccess & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Check-in failed.");
      }
      setSuccess({
        communityId: data.communityId,
        memberDisplay: data.memberDisplay,
        fullName: data.fullName,
        city: data.city,
        country: data.country,
        meetupId: data.meetupId,
        meetupName: data.meetupName,
        meetupCity: data.meetupCity,
        reputation: data.reputation,
        pointsAwarded: data.pointsAwarded,
        attendanceTx: data.attendanceTx,
        alreadyCheckedIn: Boolean(data.alreadyCheckedIn),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-300">
          BetterDev verification
        </p>
        <h1 className="mt-3 text-2xl font-black text-white">
          {success.alreadyCheckedIn ? "Already verified" : "Attendance verified"}
        </h1>
        <p className="mt-2 text-sm text-emerald-200/90">
          {success.alreadyCheckedIn
            ? "You were already checked in to this meetup."
            : `+${success.pointsAwarded} reputation recorded on-chain.`}
        </p>

        <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-black/30 p-5 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500">Name</span>
            <span className="text-right font-bold text-white">{success.fullName || "—"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500">City</span>
            <span className="text-right font-bold text-white">{success.city || "—"}</span>
          </div>
          {success.country ? (
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Country</span>
              <span className="text-right font-bold text-white">{success.country}</span>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500">Community ID</span>
            <span className="font-mono font-bold text-brand-sky">{success.communityId}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500">Meetup</span>
            <span className="text-right font-bold text-white">{success.meetupName}</span>
          </div>
          {success.meetupCity ? (
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Event city</span>
              <span className="text-right font-bold text-white">{success.meetupCity}</span>
            </div>
          ) : null}
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Total reputation</span>
              <span className="text-xl font-black text-white">{success.reputation}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start gap-4">
          {success.attendanceTx && success.attendanceTx !== "on-chain-existing" && (
            <a
              href={transactionExplorerUrl(success.attendanceTx)}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-bold text-brand-sky transition hover:text-white"
            >
              View on-chain proof
            </a>
          )}
          <Link
            href="/meetup"
            className="inline-flex rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white"
          >
            Open Passport
          </Link>
          <Link
            href="/profile"
            className="text-sm font-bold text-brand-sky transition hover:text-white"
          >
            View profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">BetterDev verification</p>
      <h1 className="mt-3 text-2xl font-black text-white">Verify your attendance</h1>
      <p className="mt-3 text-sm text-zinc-400">
        Enter your member number from registration. We will verify you at this meetup and award +20 reputation
        on-chain.
      </p>
      <p className="mt-2 text-xs text-zinc-600">Meetup: {meetupId || DEMO_MEETUP.id}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="checkin-member-number" className="text-xs font-bold text-zinc-400">
            Member number
          </label>
          <div className="mt-2 flex overflow-hidden rounded-xl border border-white/10 bg-black focus-within:border-brand-sky/40">
            <span className="flex items-center border-r border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-sm font-bold text-brand-sky">
              {COMMUNITY_ID_PREFIX}
            </span>
            <input
              id="checkin-member-number"
              type="text"
              inputMode="numeric"
              required
              maxLength={4}
              autoFocus
              value={memberNumber}
              onChange={(e) => setMemberNumber(sanitizeMemberNumberInput(e.target.value))}
              className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm text-white outline-none"
              placeholder="0001"
            />
          </div>
          <p className="mt-2 text-[11px] text-zinc-600">
            From your registration confirmation.{" "}
            <Link href="/join" className="font-bold text-brand-sky hover:text-white">
              Join first
            </Link>{" "}
            if you do not have a number yet.
          </p>
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
          {submitting ? "Verifying…" : "Verify attendance"}
        </button>
      </form>
    </div>
  );
}

export default function CheckinPage() {
  return (
    <div className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-md">
        <Suspense fallback={<div className="text-zinc-500">Loading check-in…</div>}>
          <CheckinForm />
        </Suspense>
      </div>
    </div>
  );
}

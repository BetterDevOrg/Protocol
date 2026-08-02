"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type MeetupEvent = {
  slug: string;
  name: string;
  city: string;
  country?: string;
};

// --- NAYA COMPONENT: CopyLinkButton ---
function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
      alert("Failed to copy the link. Please copy the URL from your browser manually.");
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:border-white/30 hover:text-white"
    >
      {copied ? "Copied! ✓" : "Copy RSVP link"}
    </button>
  );
}
// --------------------------------------

export default function MeetupRsvpPage() {
  const params = useParams();
  const meetupId = typeof params.meetupId === "string" ? params.meetupId : "";

  const [event, setEvent] = useState<MeetupEvent | null>(null);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [rsvped, setRsvped] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [communityId, setCommunityId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkCopyError, setLinkCopyError] = useState(false);

  useEffect(() => {
    if (!meetupId) return;
    let cancelled = false;

    (async () => {
      try {
        const [rsvpRes, meRes] = await Promise.all([
          fetch(`/api/meetups/${encodeURIComponent(meetupId)}/rsvp`, { cache: "no-store" }),
          fetch("/api/auth/me", { cache: "no-store" }),
        ]);

        const rsvpData = (await rsvpRes.json()) as {
          event?: MeetupEvent;
          rsvpCount?: number;
          error?: string;
        };
        if (!rsvpRes.ok) {
          throw new Error(rsvpData.error ?? "Could not load meetup.");
        }

        if (!cancelled) {
          setEvent(rsvpData.event ?? null);
          setRsvpCount(rsvpData.rsvpCount ?? 0);
        }

        const meData = (await meRes.json()) as {
          authenticated?: boolean;
          member?: { communityId: string };
        };
        if (!cancelled) {
          setSignedIn(Boolean(meData.authenticated));
          const id = meData.member?.communityId?.trim().toUpperCase() ?? "";
          setCommunityId(id);
        }

        if (meData.authenticated && meData.member?.communityId) {
          const statusRes = await fetch(
            `/api/meetups/${encodeURIComponent(meetupId)}/rsvp?communityId=${encodeURIComponent(meData.member.communityId)}`,
            { cache: "no-store" },
          );
          const statusData = (await statusRes.json()) as { rsvped?: boolean };
          if (!cancelled && statusRes.ok) {
            setRsvped(Boolean(statusData.rsvped));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load meetup.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [meetupId]);

  const copyRsvpLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setLinkCopyError(false);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopyError(true);
      window.setTimeout(() => setLinkCopyError(false), 2000);
    }
  };

  const submitRsvp = async () => {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/meetups/${encodeURIComponent(meetupId)}/rsvp`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        ok?: boolean;
        alreadyRecorded?: boolean;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not RSVP.");
      }
      setRsvped(true);
      setRsvpCount((count) => count + (data.alreadyRecorded ? 0 : 1));
      setSuccess(data.alreadyRecorded ? "You're already on the RSVP list." : "You're RSVP'd! Check your email after groups are assigned.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not RSVP.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-black px-5 py-16 text-white">
        <div className="mx-auto max-w-lg text-zinc-500">Loading meetup…</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-lg">
        <Link href="/meetup" className="text-xs font-bold text-brand-sky transition hover:text-white">
          ← Back to Passport
        </Link>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">Meetup RSVP</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">{event?.name ?? meetupId}</h1>
        {event ? (
          <p className="mt-3 text-sm text-zinc-400">
            {event.city}
            {event.country ? `, ${event.country}` : ""} · {rsvpCount} RSVP{rsvpCount === 1 ? "" : "s"}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void copyRsvpLink()}
          className={`mt-4 inline-flex items-center gap-1.5 text-xs font-bold transition ${
            linkCopied
              ? "text-emerald-400"
              : linkCopyError
                ? "text-brand-pink"
                : "text-brand-sky hover:text-white"
          }`}
        >
          {linkCopied && (
            <svg
              className="size-3.5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 10.5l4 4 8-9" />
            </svg>
          )}
          {linkCopied ? "Copied!" : linkCopyError ? "Couldn&apos;t copy - try again" : "Copy RSVP link"}
        </button>
        <span role="status" aria-live="polite" className="sr-only">
          {linkCopied
            ? "RSVP link copied to clipboard"
            : linkCopyError
              ? "Could not copy RSVP link"
              : ""}
        </span>

        <p className="mt-6 text-sm text-zinc-400">
          RSVP before the event so the organizer can match you into a Builder Circle. Your group will be
          emailed once matching runs.
        </p>

        {/* COPY LINK BUTTON INTEGRATED HERE */}
        <div className="mt-6">
          <CopyLinkButton />
        </div>

        {signedIn === false ? (
          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-6 text-sm text-amber-100">
            <p className="font-bold">Sign in to RSVP</p>
            <p className="mt-2">
              Log in with your member email on{" "}
              <Link href="/meetup" className="font-bold text-brand-sky hover:text-white">
                the Passport page
              </Link>
              , then return here.
            </p>
          </div>
        ) : null}

        {signedIn ? (
          <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
            {communityId ? (
              <p className="text-xs text-zinc-500">
                Signed in as <span className="font-mono text-zinc-300">{communityId}</span>
              </p>
            ) : null}
            {rsvped ? (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                <p className="font-bold text-emerald-100">You&apos;re RSVP&apos;d</p>
                <p className="mt-1">We&apos;ll email your Builder Circle when the organizer runs matching.</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={submitRsvp}
                disabled={submitting}
                className="w-full rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                {submitting ? "Saving RSVP…" : "RSVP for this meetup"}
              </button>
            )}
            {success ? (
              <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">
                {success}
              </p>
            ) : null}
            <Link
              href={`/meetup/${meetupId}/circles`}
              className="inline-block text-xs font-bold text-brand-sky hover:text-white"
            >
              View Builder Circles (after assigned) →
            </Link>
          </div>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-3 text-sm text-brand-pink">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
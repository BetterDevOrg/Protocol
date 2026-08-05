"use client";

import {
  BUILDER_CIRCLE_EXAMPLE_ATTENDEES,
  BUILDER_CIRCLE_GROUP_SIZE_MAX,
  BUILDER_CIRCLE_GROUP_SIZE_MIN,
} from "@/lib/builder-circle-config";
import type { GoogleSheetsEventRecord } from "@/lib/google-sheets/types";
import type { Organizer } from "@/types/organizer";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OrganizerCardState =
  | { kind: "loading" }
  | { kind: "guest" }
  | { kind: "member-no-application" }
  | { kind: "pending"; organizer: Organizer }
  | { kind: "approved-no-event"; organizer: Organizer }
  | { kind: "approved-with-event"; organizer: Organizer; event: GoogleSheetsEventRecord; rsvpCount: number | null };

const GROUP_SIZE_LABEL = `${BUILDER_CIRCLE_GROUP_SIZE_MIN}–${BUILDER_CIRCLE_GROUP_SIZE_MAX}`;

function pickLatestEvent(events: GoogleSheetsEventRecord[]): GoogleSheetsEventRecord | null {
  if (events.length === 0) return null;
  return [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
}

function resolveCardAction(state: OrganizerCardState): {
  href: string;
  label: string;
  disabled: boolean;
  helper: string;
} {
  switch (state.kind) {
    case "loading":
      return { href: "#", label: "Loading…", disabled: true, helper: "" };
    case "guest":
      return {
        href: "/login?next=/organizer",
        label: "Organise in your city",
        disabled: false,
        helper: "Sign in to apply as a city co-lead and host BetterDev meetups locally.",
      };
    case "member-no-application":
      return {
        href: "/organizer",
        label: "Apply as city co-lead",
        disabled: false,
        helper:
          "Host BetterDev meetups in your city. Founders review every application and email approved organizers a private key to create events.",
      };
    case "pending":
      return {
        href: "/organizer",
        label: "Application under review",
        disabled: false,
        helper: `Your application for ${state.organizer.city} is with the BetterDev team. We will email you after review.`,
      };
    case "approved-no-event":
      return {
        href: "/organizer/create",
        label: "Create your first meetup",
        disabled: false,
        helper:
          "Use the organizer key from your approval email to unlock the create page, then publish your event before assigning Builder Circles.",
      };
    case "approved-with-event":
      return {
        href: `/organizer/circles/${encodeURIComponent(state.event.slug)}`,
        label: "Create fair groups",
        disabled: false,
        helper: "Run verifiable random assignment once RSVPs are in. Groups are fair — no manual picking.",
      };
    default:
      return { href: "/organizer", label: "Organise in your city", disabled: false, helper: "" };
  }
}

function resolveCardDisplay(state: OrganizerCardState): {
  kicker: string;
  title: string;
  status: string;
  statusTone: "sky" | "amber" | "emerald";
  attendees: string;
  city: string;
} {
  switch (state.kind) {
    case "loading":
      return {
        kicker: "Meetup",
        title: "Organise BetterDev Meetup in your city",
        status: "Loading",
        statusTone: "sky",
        attendees: "—",
        city: "Your location",
      };
    case "guest":
    case "member-no-application":
      return {
        kicker: "City co-lead",
        title: "Organise BetterDev Meetup in your city",
        status: "Open",
        statusTone: "sky",
        attendees: String(BUILDER_CIRCLE_EXAMPLE_ATTENDEES),
        city: "Your location",
      };
    case "pending":
      return {
        kicker: "Application",
        title: "Organise BetterDev Meetup in your city",
        status: "Under review",
        statusTone: "amber",
        attendees: String(BUILDER_CIRCLE_EXAMPLE_ATTENDEES),
        city: state.organizer.city || "Your location",
      };
    case "approved-no-event":
      return {
        kicker: "City co-lead",
        title: `Organise BetterDev Meetup in ${state.organizer.city}`,
        status: "Approved",
        statusTone: "emerald",
        attendees: String(BUILDER_CIRCLE_EXAMPLE_ATTENDEES),
        city: state.organizer.city || "Your location",
      };
    case "approved-with-event":
      return {
        kicker: "Your meetup",
        title: state.event.name,
        status: "Event live",
        statusTone: "emerald",
        attendees: state.rsvpCount != null ? String(state.rsvpCount) : "—",
        city: state.event.city || state.organizer.city || "Your location",
      };
    default:
      return {
        kicker: "Meetup",
        title: "Organise BetterDev Meetup in your city",
        status: "Open",
        statusTone: "sky",
        attendees: String(BUILDER_CIRCLE_EXAMPLE_ATTENDEES),
        city: "Your location",
      };
  }
}

export function BuilderCirclesOrganizerCard() {
  const [cardState, setCardState] = useState<OrganizerCardState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (!meRes.ok) {
          if (!cancelled) setCardState({ kind: "guest" });
          return;
        }

        const orgRes = await fetch("/api/organizers/me", { cache: "no-store" });
        if (orgRes.status === 401) {
          if (!cancelled) setCardState({ kind: "guest" });
          return;
        }

        if (!orgRes.ok) {
          if (!cancelled) setCardState({ kind: "member-no-application" });
          return;
        }

        const orgData = (await orgRes.json()) as {
          organizer?: Organizer | null;
          events?: GoogleSheetsEventRecord[];
        };

        const organizer = orgData.organizer ?? null;
        const events = orgData.events ?? [];

        if (!organizer) {
          if (!cancelled) setCardState({ kind: "member-no-application" });
          return;
        }

        if (organizer.status === "pending") {
          if (!cancelled) setCardState({ kind: "pending", organizer });
          return;
        }

        if (organizer.status !== "active") {
          if (!cancelled) setCardState({ kind: "member-no-application" });
          return;
        }

        const latestEvent = pickLatestEvent(events);
        if (!latestEvent) {
          if (!cancelled) setCardState({ kind: "approved-no-event", organizer });
          return;
        }

        let rsvpCount: number | null = null;
        try {
          const rsvpRes = await fetch(
            `/api/meetups/${encodeURIComponent(latestEvent.slug)}/rsvp`,
            { cache: "no-store" },
          );
          if (rsvpRes.ok) {
            const rsvpData = (await rsvpRes.json()) as { rsvpCount?: number };
            rsvpCount = rsvpData.rsvpCount ?? null;
          }
        } catch {
          // Non-blocking — card still works without RSVP count.
        }

        if (!cancelled) {
          setCardState({
            kind: "approved-with-event",
            organizer,
            event: latestEvent,
            rsvpCount,
          });
        }
      } catch {
        if (!cancelled) setCardState({ kind: "guest" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const display = useMemo(() => resolveCardDisplay(cardState), [cardState]);
  const action = useMemo(() => resolveCardAction(cardState), [cardState]);

  const statusColor =
    display.statusTone === "emerald"
      ? "text-emerald-400"
      : display.statusTone === "amber"
        ? "text-amber-300"
        : "text-brand-sky";

  return (
    <div className="mt-10 max-w-xl rounded-2xl border border-white/10 bg-black p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-600">{display.kicker}</p>
          <p className="mt-2 font-bold leading-snug">{display.title}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-600">Status</p>
          <p className={`mt-1 text-[10px] font-black uppercase ${statusColor}`}>{display.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 py-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Attendees</p>
          <p className="mt-2 font-black">{display.attendees}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Per group</p>
          <p className="mt-2 font-black">{GROUP_SIZE_LABEL}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">City</p>
          <p className="mt-2 font-black text-brand-sky">{display.city}</p>
        </div>
      </div>

      {action.disabled ? (
        <span className="flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white opacity-60">
          {action.label}
        </span>
      ) : (
        <Link
          href={action.href}
          className="flex w-full items-center justify-center rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white shadow-[0_0_36px_-14px_rgba(233,30,140,0.95)] transition hover:opacity-95"
        >
          {action.label}
        </Link>
      )}

      {action.helper ? (
        <p className="mt-3 text-center text-xs leading-relaxed text-zinc-600">{action.helper}</p>
      ) : null}

      <details className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-xs text-zinc-500">
        <summary className="cursor-pointer list-none font-bold text-zinc-400 transition hover:text-white [&::-webkit-details-marker]:hidden">
          How Builder Circles work
        </summary>
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4 leading-relaxed">
          <p>
            Apply as a city co-lead, create your meetup, collect RSVPs, then run fair group assignment. Attendees land
            in small circles of {GROUP_SIZE_LABEL} so they meet engineers they would not normally talk to.
          </p>
          <p>Powered by verifiable randomness via Chainlink — no favoritism, no manual picking.</p>
        </div>
      </details>
    </div>
  );
}

"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import type { GoogleSheetsEventRecord } from "@/lib/google-sheets/types";
import { slugifyFromName } from "@/lib/meetup-slug";
import {
  clearStoredOrganizerSecret,
  readStoredOrganizerSecret,
  writeStoredOrganizerSecret,
} from "@/lib/organizer-secret-storage";
import type { Organizer } from "@/types/organizer";

type CreateMeetupResponse = {
  error?: string;
  meetupId?: string;
  slug?: string;
  name?: string;
  city?: string;
  created?: boolean;
  txHash?: string;
  checkinUrl?: string;
};

type SessionResponse = {
  ok?: boolean;
  mode?: string;
  organizer?: Organizer | null;
  events?: GoogleSheetsEventRecord[];
  error?: string;
};

export default function OrganizerCreatePage() {
  const [secretInput, setSecretInput] = useState("");
  const [secret, setSecret] = useState("");
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [events, setEvents] = useState<GoogleSheetsEventRecord[]>([]);
  const [isFounderMode, setIsFounderMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [city, setCity] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [result, setResult] = useState<CreateMeetupResponse | null>(null);

  const suggestedSlug = useMemo(() => slugifyFromName(name), [name]);
  const isUnlocked = Boolean(secret);

  const loadSession = async (organizerSecret: string) => {
    const res = await fetch("/api/organizers/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: organizerSecret }),
    });
    const data = (await res.json()) as SessionResponse;
    if (!res.ok) throw new Error(data.error ?? "Invalid organizer key.");

    if (data.mode === "founder") {
      setIsFounderMode(true);
      setOrganizer(null);
      setEvents([]);
      setCity("");
      return;
    }

    setIsFounderMode(false);
    setOrganizer(data.organizer ?? null);
    setEvents(data.events ?? []);
    if (data.organizer?.city) {
      setCity(data.organizer.city);
    }
  };

  useEffect(() => {
    const stored = readStoredOrganizerSecret();
    if (!stored) {
      setLoading(false);
      return;
    }
    setSecretInput(stored);
    setSecret(stored);
    loadSession(stored)
      .catch(() => {
        clearStoredOrganizerSecret();
        setSecret("");
        setSecretInput("");
      })
      .finally(() => setLoading(false));
  }, []);

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    setUnlocking(true);
    try {
      const trimmed = secretInput.trim();
      if (!trimmed) throw new Error("Enter your organizer key.");
      await loadSession(trimmed);
      writeStoredOrganizerSecret(trimmed);
      setSecret(trimmed);
    } catch (err) {
      setUnlockError(err instanceof Error ? err.message : "Could not unlock.");
    } finally {
      setUnlocking(false);
    }
  };

  const signOut = () => {
    clearStoredOrganizerSecret();
    setSecret("");
    setSecretInput("");
    setOrganizer(null);
    setEvents([]);
    setIsFounderMode(false);
    setResult(null);
    setCity("");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugifyFromName(value));
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);
    try {
      const payload: Record<string, string> = { slug, name, city, secret };
      if (organizer?.country) payload.country = organizer.country;

      const res = await fetch("/api/meetups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as CreateMeetupResponse;
      if (!res.ok) throw new Error(data.error ?? "Could not create event.");
      setResult(data);
      if (organizer) {
        await loadSession(secret);
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create event.");
    } finally {
      setCreateLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    if (!isFounderMode && organizer) {
      setCity(organizer.city);
    } else if (isFounderMode) {
      setCity("");
    }
    setCreateError(null);
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-black px-5 py-16 text-white">
        <div className="mx-auto max-w-lg text-zinc-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-lg">
        <Link href="/organizer" className="text-xs font-bold text-brand-sky transition hover:text-white">
          ← Organizer application
        </Link>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">
          City organizer
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Create meetup</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Paste the private organizer key you received after approval. Events are locked to your
          assigned city.
        </p>

        {!isUnlocked ? (
          <form
            onSubmit={unlock}
            className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.035] p-6"
          >
            <h2 className="text-lg font-black">Organizer key</h2>
            <p className="text-sm text-zinc-400">
              This key was emailed to you after founder approval. Do not share it publicly.
            </p>
            <input
              type="password"
              autoComplete="off"
              required
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 font-mono text-sm text-white outline-none focus:border-brand-sky/40"
              placeholder="org_…"
            />
            {unlockError ? (
              <p className="rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-3 text-sm text-brand-pink">
                {unlockError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={unlocking}
              className="w-full rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              {unlocking ? "Unlocking…" : "Unlock create page"}
            </button>
          </form>
        ) : (
          <>
            <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm">
              <div>
                {isFounderMode ? (
                  <p className="font-bold text-white">Founder mode</p>
                ) : organizer ? (
                  <>
                    <p className="font-bold text-white">{organizer.fullName}</p>
                    <p className="mt-1 text-zinc-400">
                      {organizer.city}, {organizer.country} ·{" "}
                      <span className="font-mono text-brand-sky">{organizer.organizerId}</span>
                    </p>
                  </>
                ) : null}
              </div>
              <button
                type="button"
                onClick={signOut}
                className="shrink-0 text-xs font-bold text-zinc-500 hover:text-white"
              >
                Sign out key
              </button>
            </div>

            {organizer ? (
              <>
                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm">
                  <div className="flex gap-4 text-xs font-bold text-emerald-200/80">
                    <span>{organizer.eventsHosted} events</span>
                    <span>{organizer.organizerReputation} organizer rep</span>
                  </div>
                  <Link
                    href={`/organizers/${organizer.organizerId}`}
                    className="mt-3 inline-block text-xs font-bold text-brand-sky hover:text-white"
                  >
                    View public profile →
                  </Link>
                </div>
              </>
            ) : null}

            {!result?.checkinUrl ? (
              <form
                onSubmit={createEvent}
                className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.035] p-6"
              >
                <h2 className="text-lg font-black">New event</h2>
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
                </div>
                <div>
                  <label htmlFor="event-city" className="text-xs font-bold text-zinc-400">
                    City
                  </label>
                  <input
                    id="event-city"
                    type="text"
                    required
                    readOnly={Boolean(organizer)}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-sky/40 read-only:opacity-70"
                    placeholder="Lagos"
                  />
                  {organizer ? (
                    <p className="mt-2 text-[11px] text-zinc-600">
                      Locked to your assignment ({organizer.city}).
                    </p>
                  ) : null}
                </div>
                {createError ? (
                  <p className="rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-3 text-sm text-brand-pink">
                    {createError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white disabled:opacity-60"
                >
                  {createLoading ? "Creating on-chain…" : "Create event & generate QR"}
                </button>
              </form>
            ) : null}

            {result?.checkinUrl ? (
              <div className="mt-8 space-y-6">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                  <p className="font-bold text-emerald-100">{result.name}</p>
                  <p className="mt-1 text-emerald-200/90">
                    {result.city} · slug <span className="font-mono">{result.slug}</span>
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
                    href={`/meetup/${result.slug}`}
                    className="text-brand-sky transition hover:text-white"
                  >
                    Share RSVP link →
                  </Link>
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
            ) : null}

            {organizer && events.length > 0 ? (
              <div className="mt-10">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Your events</h2>
                <ul className="mt-4 space-y-3">
                  {events.map((event) => (
                    <li
                      key={event.slug}
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm"
                    >
                      <div>
                        <p className="font-bold text-white">{event.name}</p>
                        <p className="mt-1 font-mono text-xs text-zinc-600">{event.slug}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <Link
                          href={`/organizer/checkin/${event.slug}`}
                          className="text-xs font-bold text-brand-sky hover:text-white"
                        >
                          QR →
                        </Link>
                        <Link
                          href={`/meetup/${event.slug}`}
                          className="text-xs font-bold text-zinc-500 hover:text-white"
                        >
                          RSVP →
                        </Link>
                        <Link
                          href={`/organizer/circles/${event.slug}`}
                          className="text-xs font-bold text-zinc-500 hover:text-white"
                        >
                          Circles →
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

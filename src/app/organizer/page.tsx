"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Member } from "@/types/member";
import type { Organizer } from "@/types/organizer";

export default function OrganizerApplyPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);

  const [applyCity, setApplyCity] = useState("");
  const [applyCountry, setApplyCountry] = useState("");
  const [applyBio, setApplyBio] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (meRes.status === 401) {
        router.replace("/login?next=/organizer");
        return;
      }
      const meData = (await meRes.json()) as { member?: Member };
      if (!meData.member) {
        router.replace("/login?next=/organizer");
        return;
      }
      if (cancelled) return;
      setMember(meData.member);
      setApplyCity(meData.member.city ?? "");
      setApplyCountry(meData.member.country ?? "");

      const orgRes = await fetch("/api/organizers/me", { cache: "no-store" });
      const orgData = (await orgRes.json()) as { organizer?: Organizer | null };
      if (orgData.organizer) {
        setOrganizer(orgData.organizer);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);
    setApplyLoading(true);
    try {
      const res = await fetch("/api/organizers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: applyCity, country: applyCountry, bio: applyBio }),
      });
      const data = (await res.json()) as { organizer?: Organizer; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not submit application.");
      setOrganizer(data.organizer ?? null);
      setApplySuccess(true);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Could not submit application.");
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-black px-5 py-16 text-white">
        <div className="mx-auto max-w-lg text-zinc-500">Loading…</div>
      </div>
    );
  }

  const isPending = organizer?.status === "pending";
  const isActive = organizer?.status === "active";

  return (
    <div className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-lg">
        <Link href="/meetup" className="text-xs font-bold text-brand-sky transition hover:text-white">
          ← Back to Passport
        </Link>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">
          City organizer
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Apply as city co-lead</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Host BetterDev meetups in your city. Founders review every application and email approved
          organizers a private key to create events.
        </p>

        {member ? (
          <p className="mt-4 text-xs text-zinc-600">
            Signed in as {member.email} · {member.communityId}
          </p>
        ) : null}

        {isActive ? (
          <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-sm text-emerald-100">
            <p className="font-bold">You&apos;re an approved city organizer</p>
            <p className="mt-2 text-emerald-100/90">
              Check your email for your unique organizer key, then open the create page to host
              meetups in {organizer?.city}.
            </p>
            <Link
              href="/organizer/create"
              className="mt-4 inline-flex rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white"
            >
              Open create event page →
            </Link>
          </div>
        ) : null}

        {isPending || applySuccess ? (
          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-6 text-sm text-amber-100">
            <p className="font-bold">Application submitted</p>
            <p className="mt-2 text-amber-100/90">
              Your application for {organizer?.city}, {organizer?.country} is with the BetterDev
              team. We&apos;ll email you after review and interview. If approved, you&apos;ll receive
              your private organizer key and a link to create events.
            </p>
          </div>
        ) : null}

        {!organizer && member ? (
          <form
            onSubmit={handleApply}
            className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.035] p-6"
          >
            <h2 className="text-lg font-black">Application</h2>
            <p className="text-sm text-zinc-400">
              Tell us where you want to host. The founders team will be notified by email.
            </p>
            <div>
              <label htmlFor="apply-city" className="text-xs font-bold text-zinc-400">
                City you will host in
              </label>
              <input
                id="apply-city"
                type="text"
                required
                value={applyCity}
                onChange={(e) => setApplyCity(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-sky/40"
              />
            </div>
            <div>
              <label htmlFor="apply-country" className="text-xs font-bold text-zinc-400">
                Country
              </label>
              <input
                id="apply-country"
                type="text"
                required
                value={applyCountry}
                onChange={(e) => setApplyCountry(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-sky/40"
              />
            </div>
            <div>
              <label htmlFor="apply-bio" className="text-xs font-bold text-zinc-400">
                Short bio (optional)
              </label>
              <textarea
                id="apply-bio"
                rows={3}
                value={applyBio}
                onChange={(e) => setApplyBio(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-sky/40"
                placeholder="Why you want to host BetterDev in your city…"
              />
            </div>
            {applyError ? (
              <p className="rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-3 text-sm text-brand-pink">
                {applyError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={applyLoading}
              className="w-full rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {applyLoading ? "Submitting…" : "Submit application"}
            </button>
          </form>
        ) : null}

        <p className="mt-10 text-center text-xs text-zinc-600">
          Already approved?{" "}
          <Link href="/organizer/create" className="font-bold text-brand-sky hover:text-white">
            Create an event
          </Link>
          {" · "}
          <Link href="/organizers" className="font-bold text-brand-sky hover:text-white">
            Browse organizers
          </Link>
        </p>
      </div>
    </div>
  );
}

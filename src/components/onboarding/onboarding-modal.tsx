"use client";

import { COMMUNITY_URLS } from "@/lib/constants";
import { registerMember } from "@/lib/mock-member";
import type { Member } from "@/types/member";
import type { OnboardingModalStep } from "@/types/onboarding";
import { useCallback, useEffect, useId, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

function formatJoinedMonthYear(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
}

export function OnboardingModal({ open, onClose }: Props) {
  const titleId = useId();
  const [step, setStep] = useState<OnboardingModalStep>("gate");
  const [member, setMember] = useState<Member | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [xUsername, setXUsername] = useState("");
  const [commitment, setCommitment] = useState(false);
  const [xProfileLink, setXProfileLink] = useState("");
  const [screenshotFileName, setScreenshotFileName] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep("gate");
    setMember(null);
    setFullName("");
    setEmail("");
    setCity("");
    setXUsername("");
    setCommitment(false);
    setXProfileLink("");
    setScreenshotFileName(null);
  }, []);

  useEffect(() => {
    if (open) {
      reset();
      return;
    }
    const t = window.setTimeout(reset, 250);
    return () => window.clearTimeout(t);
  }, [open, reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const formValid =
    fullName.trim().length > 0 &&
    email.includes("@") &&
    city.trim().length > 0 &&
    xUsername.trim().length > 0;

  const canContinueFromForm = formValid && commitment;

  const submitRegistration = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://betterdev.community";
    const m = registerMember(
      {
        fullName: fullName.trim(),
        email: email.trim(),
        city: city.trim(),
        xUsername: xUsername.trim().replace(/^@/, ""),
        xProfileLink: xProfileLink.trim() || undefined,
        screenshotFileName: screenshotFileName ?? undefined,
      },
      origin,
    );
    setMember(m);
    setStep("success");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-md" aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] flex max-h-[min(90vh,760px)] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.65)]"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-sky">betterdev</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          {step === "gate" && (
            <div className="space-y-6">
              <div>
                <h2 id={titleId} className="text-xl font-semibold tracking-tight text-white">
                  Before joining, connect with the network
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Follow and join so you’re ready to grow with the community—nothing is blocked here.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <a
                  href={COMMUNITY_URLS.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                >
                  Follow on X
                </a>
                <a
                  href={COMMUNITY_URLS.communityHub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                >
                  Join community
                </a>
                <a
                  href={COMMUNITY_URLS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-xl border border-dashed border-white/20 bg-transparent px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-white/30 hover:text-zinc-300"
                >
                  Follow on LinkedIn{" "}
                  <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                    optional
                  </span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setStep("form")}
                className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100"
              >
                Continue
              </button>
            </div>
          )}

          {step === "form" && (
            <div className="space-y-5">
              <div>
                <h2 id={titleId} className="text-xl font-semibold tracking-tight text-white">
                  Your details
                </h2>
                <p className="mt-1 text-sm text-zinc-400">We’ll issue your Community ID instantly—no waiting list games.</p>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-zinc-400">Name</span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none ring-brand-purple/40 placeholder:text-zinc-600 focus:ring-2"
                    placeholder="Jane Doe"
                    autoComplete="name"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-zinc-400">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none ring-brand-purple/40 placeholder:text-zinc-600 focus:ring-2"
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-zinc-400">City</span>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none ring-brand-purple/40 placeholder:text-zinc-600 focus:ring-2"
                    placeholder="Seattle"
                    autoComplete="address-level2"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-zinc-400">X username</span>
                  <input
                    value={xUsername}
                    onChange={(e) => setXUsername(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none ring-brand-purple/40 placeholder:text-zinc-600 focus:ring-2"
                    placeholder="@handle"
                    autoComplete="username"
                  />
                </label>
              </div>

              <label className="flex cursor-pointer gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                <input
                  type="checkbox"
                  checked={commitment}
                  onChange={(e) => setCommitment(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 rounded border-white/30 bg-zinc-800 text-brand-purple focus:ring-brand-purple"
                />
                <span className="text-sm leading-snug text-zinc-300">
                  I’ve followed BetterDev on X and joined the community
                </span>
              </label>

              <p className="text-[11px] leading-relaxed text-zinc-500">
                Checking this unlocks the next step—it’s a commitment nudge, not a gatekeeper. You’re still in control.
              </p>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep("gate")}
                  className="flex-1 rounded-full border border-white/15 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!canContinueFromForm}
                  onClick={() => setStep("optional")}
                  className="flex-1 rounded-full bg-white py-3 text-sm font-semibold text-zinc-900 shadow disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === "optional" && (
            <div className="space-y-5">
              <div>
                <h2 id={titleId} className="text-xl font-semibold tracking-tight text-white">
                  Optional verification
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Help us recognize you—skip anytime. Nothing here is required to get your ID.
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-zinc-400">X profile link</span>
                <input
                  value={xProfileLink}
                  onChange={(e) => setXProfileLink(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none ring-brand-purple/40 placeholder:text-zinc-600 focus:ring-2"
                  placeholder="https://x.com/yourhandle"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-zinc-400">Screenshot (optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setScreenshotFileName(f ? f.name : null);
                  }}
                  className="mt-1 block w-full text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
                />
                {screenshotFileName && (
                  <p className="mt-1 text-[11px] text-zinc-500">Selected: {screenshotFileName}</p>
                )}
              </label>

              <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="sm:flex-1 rounded-full border border-white/15 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={submitRegistration}
                  className="sm:flex-1 rounded-full border border-white/15 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={submitRegistration}
                  className="sm:flex-1 rounded-full bg-brand-purple py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-pink"
                >
                  Join BetterDev
                </button>
              </div>
            </div>
          )}

          {step === "success" && member && (
            <div className="space-y-6 text-center sm:text-left">
              <div className="text-4xl" aria-hidden>
                🎉
              </div>
              <div>
                <h2 id={titleId} className="text-xl font-semibold tracking-tight text-white">
                  Welcome to BetterDev
                </h2>
                <p className="mt-3 text-sm text-zinc-300">
                  You are Member{" "}
                  <span className="font-mono font-semibold text-brand-sky">#{member.memberDisplay}</span>
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Joined: {formatJoinedMonthYear(member.joinDate)} · Reputation:{" "}
                  <span className="tabular-nums text-white">{member.reputation}</span>
                </p>
                <p className="mt-2 font-mono text-lg font-semibold text-white">{member.communityId}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Complete your onboarding
                </p>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li className="flex justify-between gap-2">
                    <span>Follow on X</span>
                    <span className="font-semibold text-brand-sky">+5</span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Join community</span>
                    <span className="font-semibold text-brand-sky">+5</span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Attend first meetup</span>
                    <span className="font-semibold text-brand-sky">+10</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-brand-purple/30 bg-brand-purple/10 p-4 text-left">
                <p className="text-xs font-semibold text-white">Your invite link</p>
                <p className="mt-2 break-all font-mono text-[11px] text-brand-sky sm:text-xs">{member.inviteLink}</p>
                <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                  Invite 2 engineers who join → <span className="font-semibold text-white">+10 reputation</span> when
                  they claim their IDs.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {step !== "success" && (
          <div className="shrink-0 border-t border-white/10 px-5 py-3">
            <div className="flex justify-center gap-1.5">
              {(["gate", "form", "optional"] as const).map((s) => (
                <span
                  key={s}
                  className={`h-1.5 w-8 rounded-full transition ${step === s ? "bg-brand-sky" : "bg-white/15"}`}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

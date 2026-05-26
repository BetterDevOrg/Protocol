"use client";

import {
  OnboardingError,
  OnboardingField,
  OnboardingGhostButton,
  OnboardingLinkButton,
  OnboardingPrimaryButton,
  OnboardingSecondaryButton,
  OnboardingSelect,
} from "@/components/onboarding/onboarding-ui";
import {
  BETTERDEV_COUNTRIES,
  COMMUNITY_URLS,
  COUNTRY_WHATSAPP_LINKS,
  type BetterDevCountry,
} from "@/lib/constants";
import { registerMember } from "@/lib/members";
import { dialCodeForCountry, validatePhoneForCountry } from "@/lib/phone-validation";
import type { Member } from "@/types/member";
import type { OnboardingModalStep } from "@/types/onboarding";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

function formatJoinedMonthYear(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
}

const STEPS: OnboardingModalStep[] = ["gate", "form", "optional"];
const COUNTRY_LABEL_BY_VALUE = Object.fromEntries(
  BETTERDEV_COUNTRIES.filter((c) => c.value).map((c) => [c.value, c.label]),
) as Record<string, string>;

export function OnboardingModal({ open, onClose }: Props) {
  const titleId = useId();
  const [step, setStep] = useState<OnboardingModalStep>("gate");
  const [member, setMember] = useState<Member | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [xUsername, setXUsername] = useState("");
  const [commitment, setCommitment] = useState(false);
  const [xProfileLink, setXProfileLink] = useState("");
  const [screenshotFileName, setScreenshotFileName] = useState<string | null>(null);

  const stripLeadingDialPrefix = useCallback((value: string, prefix: string | null) => {
    const trimmed = value.trim();
    if (!prefix || !trimmed.startsWith(prefix)) return trimmed;
    return trimmed.slice(prefix.length).trimStart();
  }, []);

  const reset = useCallback(() => {
    setStep("gate");
    setMember(null);
    setSubmitting(false);
    setError(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setCity("");
    setCountry("");
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
      if (e.key === "Escape" && open && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, submitting]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const phoneHint = dialCodeForCountry(country);

  const phoneError = useMemo(() => {
    if (!country || !phone.trim()) return null;
    const result = validatePhoneForCountry(phone, country);
    return result.ok ? null : result.error;
  }, [phone, country]);

  const formValid =
    fullName.trim().length > 0 &&
    email.includes("@") &&
    phone.trim().length > 0 &&
    country.trim().length > 0 &&
    city.trim().length > 0 &&
    xUsername.trim().length > 0 &&
    !phoneError;

  const canContinueFromForm = formValid && commitment;

  const goToOptional = () => {
    if (!country) {
      setError("Select your country of residence.");
      return;
    }
    const check = validatePhoneForCountry(phone, country);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setError(null);
    setStep("optional");
  };

  const submitRegistration = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const origin = window.location.origin;
      const m = await registerMember(
        {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim(),
          country,
          xUsername: xUsername.trim().replace(/^@/, ""),
          xProfileLink: xProfileLink.trim() || undefined,
          screenshotFileName: screenshotFileName ?? undefined,
          followedX: commitment,
          joinedCommunity: commitment,
        },
        origin,
      );
      setMember(m);
      setStep("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const stepIndex = STEPS.indexOf(step as (typeof STEPS)[number]);
  const memberCountry = (member?.country ?? "") as BetterDevCountry;
  const countryLabel = memberCountry ? COUNTRY_LABEL_BY_VALUE[memberCountry] ?? memberCountry : "";
  const whatsappLink = memberCountry ? COUNTRY_WHATSAPP_LINKS[memberCountry] : undefined;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] flex max-h-[min(92vh,780px)] w-full max-w-[460px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)]"
      >
        <div className="h-1 shrink-0 bg-brand-sash-diag" aria-hidden />

        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-sky">betterdev</span>
            <p className="mt-0.5 text-[11px] text-zinc-500">Join the community</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <OnboardingError message={error} />

          {step === "gate" && (
            <div className="space-y-6">
              <div>
                <h2 id={titleId} className="text-xl font-semibold tracking-tight text-white">
                  Before joining, connect with the network
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Follow and join so you&apos;re ready to grow with the community—nothing is blocked here.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <OnboardingLinkButton href={COMMUNITY_URLS.x}>Follow on X</OnboardingLinkButton>
                <OnboardingLinkButton href={COMMUNITY_URLS.linkedin} variant="optional">
                  Follow on LinkedIn{" "}
                  <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                    optional
                  </span>
                </OnboardingLinkButton>
              </div>

              <OnboardingGhostButton className="w-full" onClick={() => setStep("form")}>
                Continue
              </OnboardingGhostButton>
            </div>
          )}

          {step === "form" && (
            <div className="space-y-5">
              <div>
                <h2 id={titleId} className="text-xl font-semibold tracking-tight text-white">
                  Your details
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                  We&apos;ll save your profile and issue your Community ID instantly.
                </p>
              </div>

              <div className="space-y-3.5">
                <OnboardingField
                  label="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="name"
                />
                <OnboardingField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
                <OnboardingSelect
                  label="Country of residence"
                  value={country}
                  onChange={(e) => {
                    const nextCountry = e.target.value;
                    const nextDial = dialCodeForCountry(nextCountry);
                    const previousDial = dialCodeForCountry(country);
                    const localPart = stripLeadingDialPrefix(phone, previousDial);
                    const nextPhone = nextDial ? `${nextDial}${localPart ? ` ${localPart}` : " "}` : localPart;

                    setCountry(nextCountry);
                    setPhone(nextPhone);
                  }}
                >
                  {BETTERDEV_COUNTRIES.map((c) => (
                    <option key={c.value || "empty"} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </OnboardingSelect>
                <OnboardingField
                  label="Phone number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={phoneHint ? `${phoneHint} 801 234 5678` : "+234 801 234 5678"}
                  autoComplete="tel"
                />
                {phoneHint && (
                  <p className="text-[11px] leading-relaxed text-zinc-500">
                    Must be a {phoneHint} number for your selected country. VPN or location mismatches may be
                    flagged.
                  </p>
                )}
                {phoneError && <p className="text-[11px] text-brand-pink">{phoneError}</p>}
                <OnboardingField
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Lagos"
                  autoComplete="address-level2"
                />
                <OnboardingField
                  label="X username"
                  value={xUsername}
                  onChange={(e) => setXUsername(e.target.value)}
                  placeholder="@handle"
                  autoComplete="username"
                />
              </div>

              <label className="flex cursor-pointer gap-3 rounded-xl border border-white/10 bg-gradient-to-br from-brand-purple/10 to-brand-sky/5 p-3.5">
                <input
                  type="checkbox"
                  checked={commitment}
                  onChange={(e) => setCommitment(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 rounded border-white/30 bg-zinc-900 accent-brand-pink"
                />
                <span className="text-sm leading-snug text-zinc-200">
                  I&apos;ve followed BetterDev on X and joined the community
                </span>
              </label>

              <p className="text-[11px] leading-relaxed text-zinc-500">
                Checking this unlocks the next step—a commitment nudge, not a gatekeeper.
              </p>

              <div className="flex gap-3 pt-1">
                <OnboardingSecondaryButton className="flex-1" onClick={() => setStep("gate")}>
                  Back
                </OnboardingSecondaryButton>
                <OnboardingPrimaryButton
                  className="flex-1"
                  disabled={!canContinueFromForm}
                  onClick={goToOptional}
                >
                  Continue
                </OnboardingPrimaryButton>
              </div>
            </div>
          )}

          {step === "optional" && (
            <div className="space-y-5">
              <div>
                <h2 id={titleId} className="text-xl font-semibold tracking-tight text-white">
                  Optional verification
                </h2>
                <p className="mt-1.5 text-sm text-zinc-400">
                  Help us recognize you—skip anytime. Nothing here is required to get your ID.
                </p>
              </div>

              <OnboardingField
                label="X profile link"
                value={xProfileLink}
                onChange={(e) => setXProfileLink(e.target.value)}
                placeholder="https://x.com/yourhandle"
              />

              <label className="block">
                <span className="text-xs font-medium tracking-wide text-zinc-400">Screenshot (optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setScreenshotFileName(f ? f.name : null);
                  }}
                  className="mt-1.5 block w-full text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-purple/30 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
                />
                {screenshotFileName && (
                  <p className="mt-1 text-[11px] text-zinc-500">Selected: {screenshotFileName}</p>
                )}
              </label>

              <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:gap-3">
                <OnboardingSecondaryButton className="sm:flex-1" onClick={() => setStep("form")} disabled={submitting}>
                  Back
                </OnboardingSecondaryButton>
                <OnboardingSecondaryButton className="sm:flex-1" onClick={submitRegistration} disabled={submitting}>
                  {submitting ? "Saving…" : "Skip for now"}
                </OnboardingSecondaryButton>
                <OnboardingPrimaryButton className="sm:flex-1" onClick={submitRegistration} disabled={submitting}>
                  {submitting ? "Saving…" : "Join BetterDev"}
                </OnboardingPrimaryButton>
              </div>
            </div>
          )}

          {step === "success" && member && (
            <div className="space-y-6 text-center sm:text-left">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-brand-sash-diag text-2xl">
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
                {countryLabel && <p className="mt-1 text-sm text-zinc-400">Country: {countryLabel}</p>}
                <p className="mt-2 font-mono text-lg font-semibold text-brand-pink">{member.communityId}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-4 text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-sky">
                  Complete your onboarding
                </p>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li className="flex justify-between gap-2">
                    <span>Follow on X</span>
                    <span className="font-semibold text-brand-pink">+5</span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Join community</span>
                    <span className="font-semibold text-brand-pink">+5</span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Attend first meetup</span>
                    <span className="font-semibold text-brand-sky">+10</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-brand-purple/40 bg-gradient-to-br from-brand-purple/20 to-brand-pink/10 p-4 text-left">
                <p className="text-xs font-semibold text-white">Your invite link</p>
                <p className="mt-2 break-all font-mono text-[11px] text-brand-sky sm:text-xs">{member.inviteLink}</p>
                <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                  Invite 2 engineers who join → <span className="font-semibold text-white">+10 reputation</span> when
                  they claim their IDs.
                </p>
              </div>

              {whatsappLink && (
                <div className="rounded-xl border border-brand-sky/35 bg-brand-sky/10 p-4 text-left">
                  <p className="text-xs font-semibold text-white">Country community access</p>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                    Request permission to join the BetterDev {countryLabel} WhatsApp group.
                  </p>
                  <OnboardingPrimaryButton className="mt-3 w-full" onClick={() => window.open(whatsappLink, "_blank")}>
                    Request WhatsApp access ({countryLabel})
                  </OnboardingPrimaryButton>
                </div>
              )}

              <OnboardingGhostButton className="w-full" onClick={onClose}>
                Done
              </OnboardingGhostButton>
            </div>
          )}
        </div>

        {step !== "success" && (
          <div className="shrink-0 border-t border-white/10 px-5 py-3">
            <div className="flex justify-center gap-2">
              {STEPS.map((s, i) => (
                <span
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    step === s ? "w-8 bg-brand-sash-diag" : i < stepIndex ? "w-3 bg-brand-sky/60" : "w-3 bg-white/15"
                  }`}
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

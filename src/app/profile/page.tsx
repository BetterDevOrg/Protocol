"use client";

import type { Member } from "@/types/member";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function formatJoinDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function ProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/login?next=/profile");
          return;
        }
        const data = (await res.json()) as { member?: Member; error?: string };
        if (!res.ok || !data.member) {
          throw new Error(data.error ?? "Could not load profile.");
        }
        if (!cancelled) setMember(data.member);
      } catch {
        if (!cancelled) router.replace("/login?next=/profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const copyInviteLink = async () => {
    if (!member?.inviteLink) return;
    try {
      await navigator.clipboard.writeText(member.inviteLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-black px-5 py-16 text-white">
        <div className="mx-auto max-w-lg text-zinc-500">Loading profile…</div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">Your profile</p>
          <h1 className="mt-3 text-2xl font-black text-white">{member.fullName || "BetterDev member"}</h1>
          <p className="mt-2 text-sm text-zinc-400">Signed in as {member.email}</p>

          <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-black/30 p-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Community ID</span>
              <span className="font-mono font-bold text-brand-sky">{member.communityId}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Member #</span>
              <span className="font-mono font-bold text-white">{member.memberDisplay}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">City</span>
              <span className="text-right font-bold text-white">{member.city || "—"}</span>
            </div>
            {member.country ? (
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Country</span>
                <span className="text-right font-bold text-white">{member.country}</span>
              </div>
            ) : null}
            {member.xHandle ? (
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">X</span>
                <span className="text-right font-bold text-white">@{member.xHandle.replace(/^@/, "")}</span>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Joined</span>
              <span className="text-right font-bold text-white">{formatJoinDate(member.joinDate)}</span>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Reputation</span>
                <span className="text-xl font-black text-white">{member.reputation}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold text-zinc-500">Invite link</p>
              <p className="mt-2 break-all font-mono text-xs text-zinc-300">{member.inviteLink}</p>
              <button
                type="button"
                onClick={copyInviteLink}
                className="mt-3 text-sm font-bold text-brand-sky transition hover:text-white"
              >
                {copied ? "Copied" : "Copy invite link"}
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/meetup"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white"
              >
                Open Passport
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:border-white/30 hover:text-white disabled:opacity-60"
              >
                {loggingOut ? "Signing out…" : "Log out"}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          <Link href="/" className="font-bold text-brand-sky hover:text-white">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

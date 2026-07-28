"use client";

import { useMemberAuth } from "@/hooks/use-member-auth";
import Link from "next/link";

function AccountIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

type AccountNavButtonProps = {
  variant: "sidebar" | "mobile";
};

export function AccountNavButton({ variant }: AccountNavButtonProps) {
  const authenticated = useMemberAuth();
  const isAuthenticated = authenticated === true;

  const href = isAuthenticated ? "/profile" : "/login";
  const label = isAuthenticated ? "Profile" : "Log in";
  const verticalLabel = isAuthenticated ? "PROFILE" : "LOGIN";

  if (variant === "sidebar") {
    return (
      <div className="mt-auto flex flex-col items-center gap-3 pb-2">
        <span
          className="text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-400"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {verticalLabel}
        </span>
        <Link
          href={href}
          className="flex size-9 items-center justify-center rounded-lg bg-brand-purple text-white shadow-md transition hover:bg-brand-pink"
          aria-label={label}
        >
          <AccountIcon />
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-purple text-white shadow-md transition hover:bg-brand-pink"
      aria-label={label}
      title={label}
    >
      <AccountIcon />
    </Link>
  );
}
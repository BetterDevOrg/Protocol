"use client";

import Image from "next/image";
import { MilestoneBadgeMintActions } from "@/components/badges/milestone-badge-mint-actions";
import {
  getMilestoneBadgeDisplayStatus,
  TIER_STYLES,
  type MilestoneBadgeContext,
  type MilestoneBadgeDefinition,
} from "@/lib/milestone-badges";

type MilestoneBadgeCardProps = {
  badge: MilestoneBadgeDefinition;
  context: MilestoneBadgeContext;
  showMintActions?: boolean;
  onMintSuccess?: (badgeId: string, tokenId: number, mintTx?: string) => void;
};

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6V11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MilestoneBadgeCard({
  badge,
  context,
  showMintActions = false,
  onMintSuccess,
}: MilestoneBadgeCardProps) {
  const displayStatus = getMilestoneBadgeDisplayStatus(badge, context);
  const tierStyle = TIER_STYLES[badge.tier];
  const repProgress =
    badge.threshold > 0 ? Math.min(100, Math.round((context.reputation / badge.threshold) * 100)) : 0;
  const highlighted = displayStatus !== "locked";

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white/[0.035] transition duration-300 ${
        highlighted
          ? `${tierStyle.ring} ${tierStyle.glow} hover:-translate-y-1`
          : "border-white/10 opacity-95 hover:border-white/20"
      }`}
    >
      <div className="relative mx-auto mt-6 flex h-44 w-36 items-center justify-center sm:h-48 sm:w-40">
        <Image
          src={badge.image}
          alt={badge.name}
          width={320}
          height={400}
          className={`h-full w-auto object-contain transition duration-500 ${
            highlighted ? "scale-100" : "scale-95 grayscale brightness-75 contrast-90"
          } group-hover:scale-[1.02]`}
        />
        {displayStatus === "locked" ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-300 backdrop-blur-sm">
              <LockIcon className="text-zinc-400" />
              Locked
            </span>
          </div>
        ) : displayStatus === "minted" ? (
          <span className="absolute -top-1 right-0 rounded-full border border-brand-sky/30 bg-brand-sky/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand-sky">
            Owned
          </span>
        ) : (
          <span className="absolute -top-1 right-0 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
            Ready
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 pt-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-pink">
          {badge.requirementLabel}
        </p>
        <h3 className="mt-2 text-base font-black text-white">{badge.name}</h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-zinc-500">{badge.description}</p>

        {displayStatus === "locked" ? (
          <div className="mt-4 space-y-2">
            <p className="text-[11px] leading-relaxed text-zinc-400">{badge.unlockHint}</p>
            {badge.threshold > 0 ? (
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-600">
                  <span>{context.reputation} Rep</span>
                  <span>{badge.threshold} Rep</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand-sky transition-all duration-700"
                    style={{ width: `${repProgress}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <ul className="mt-4 space-y-1.5 text-[11px] text-zinc-500">
              {badge.futureBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand-sky">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            {showMintActions ? (
              <MilestoneBadgeMintActions badge={badge} context={context} onMintSuccess={onMintSuccess} />
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}

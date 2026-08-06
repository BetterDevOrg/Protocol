"use client";

import {
  countMintedMilestoneBadges,
  countUnlockedMilestoneBadges,
  getMilestoneBadgeDisplayStatus,
  getNextMilestoneBadge,
  MILESTONE_BADGE_DEFINITIONS,
  type MilestoneBadgeContext,
} from "@/lib/milestone-badges";
import { MilestoneBadgeCard } from "@/components/badges/milestone-badge-card";

type MilestoneProgressBarProps = {
  context: MilestoneBadgeContext;
};

export function MilestoneProgressBar({ context }: MilestoneProgressBarProps) {
  const next = getNextMilestoneBadge(context);
  const maxThreshold = MILESTONE_BADGE_DEFINITIONS.at(-1)?.threshold ?? 250;
  const percent = Math.min(100, Math.round((context.reputation / maxThreshold) * 100));

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-600">Reputation ladder</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-white">{context.reputation} Rep</p>
        </div>
        {next ? (
          <p className="max-w-xs text-right text-xs leading-relaxed text-zinc-500">
            {getMilestoneBadgeDisplayStatus(next.badge, context) === "ready" ? (
              <>
                Ready to mint{" "}
                <span className="font-bold text-white">{next.badge.name}</span>
              </>
            ) : next.badge.id === "betterdev-passport" ? (
              <>Next: mint your <span className="font-bold text-white">{next.badge.name}</span></>
            ) : next.repRemaining > 0 ? (
              <>
                <span className="font-bold text-brand-sky">{next.repRemaining} Rep</span> to{" "}
                <span className="font-bold text-white">{next.badge.name}</span>
              </>
            ) : (
              <>Next: <span className="font-bold text-white">{next.badge.name}</span></>
            )}
          </p>
        ) : (
          <p className="text-xs font-bold text-emerald-300">All milestone badges minted</p>
        )}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-brand-sash-diag transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

type MilestoneBadgeGridProps = {
  context: MilestoneBadgeContext;
  showMintActions?: boolean;
  onMintSuccess?: (badgeId: string, tokenId: number, mintTx?: string) => void;
};

export function MilestoneBadgeGrid({ context, showMintActions = false, onMintSuccess }: MilestoneBadgeGridProps) {
  const unlockedCount = countUnlockedMilestoneBadges(context);
  const mintedCount = countMintedMilestoneBadges(context);
  const total = MILESTONE_BADGE_DEFINITIONS.length;

  return (
    <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
      <div className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-zinc-600">Earn milestone NFTs</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Milestone badges</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            Reputation unlocks collectible badges. Mint them to your wallet as NFTs — future perks will attach to what
            you hold.
          </p>
        </div>
        <p className="text-xs font-bold text-zinc-600">
          {mintedCount} minted · {unlockedCount} of {total} ready
        </p>
      </div>

      <MilestoneProgressBar context={context} />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {MILESTONE_BADGE_DEFINITIONS.map((badge) => (
          <MilestoneBadgeCard
            key={badge.id}
            badge={badge}
            context={context}
            showMintActions={showMintActions}
            onMintSuccess={onMintSuccess}
          />
        ))}
      </div>
    </section>
  );
}

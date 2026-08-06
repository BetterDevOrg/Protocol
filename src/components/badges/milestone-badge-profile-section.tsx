"use client";

import { MilestoneBadgeCard } from "@/components/badges/milestone-badge-card";
import { MilestoneProgressBar } from "@/components/badges/milestone-badge-grid";
import { Spinner } from "@/components/ui/spinner";
import { useMilestoneBadgeContext } from "@/hooks/use-milestone-badge-context";
import {
  countMintedMilestoneBadges,
  countUnlockedMilestoneBadges,
  MILESTONE_BADGE_DEFINITIONS,
} from "@/lib/milestone-badges";

type MilestoneBadgeProfileSectionProps = {
  email?: string;
};

export function MilestoneBadgeProfileSection({ email }: MilestoneBadgeProfileSectionProps) {
  const { context, loading, error, updateMintedBadge } = useMilestoneBadgeContext({ email, enabled: true });
  const unlockedCount = countUnlockedMilestoneBadges(context);
  const mintedCount = countMintedMilestoneBadges(context);
  const total = MILESTONE_BADGE_DEFINITIONS.length;

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">Your trophy case</p>
          <h2 className="mt-2 text-xl font-black text-white">Milestone badges</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
            Track what you have unlocked, mint milestone NFTs to your wallet, and see what is next.
          </p>
        </div>
        {!loading ? (
          <p className="text-xs font-bold text-zinc-600">
            {mintedCount} minted · {unlockedCount} of {total} ready
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] py-12">
          <Spinner size="md" />
          <p className="text-sm text-zinc-500">Loading your badges…</p>
        </div>
      ) : error ? (
        <p className="mt-6 rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-4 text-sm text-brand-pink">
          {error}
        </p>
      ) : (
        <>
          <div className="mt-6">
            <MilestoneProgressBar context={context} />
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {MILESTONE_BADGE_DEFINITIONS.map((badge) => (
              <MilestoneBadgeCard
                key={badge.id}
                badge={badge}
                context={context}
                showMintActions
                onMintSuccess={updateMintedBadge}
              />
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
            <p className="text-xs text-zinc-500">
              {mintedCount === total
                ? "You have minted every milestone badge NFT. Future perks will attach to what you hold."
                : unlockedCount > mintedCount
                  ? "Ready badges can be minted here. Connect your wallet and confirm the transaction."
                  : "Earn reputation and verify attendance to unlock the next milestone badge."}
            </p>
          </div>
        </>
      )}
    </section>
  );
}

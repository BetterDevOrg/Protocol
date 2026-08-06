import { id } from "ethers";

export type MilestoneBadgeTier = "passport" | "silver" | "gold" | "diamond";
export type MilestoneBadgeMintKind = "identity" | "meetup" | "milestone";

export type MilestoneBadgeDefinition = {
  id: string;
  name: string;
  threshold: number;
  description: string;
  tier: MilestoneBadgeTier;
  image: string;
  unlockHint: string;
  requirementLabel: string;
  futureBenefits: string[];
  mintKind: MilestoneBadgeMintKind;
};

export type MilestoneBadgeEligibility = "locked" | "eligible";

/** @deprecated Use MilestoneBadgeDisplayStatus instead. */
export type MilestoneBadgeUnlockStatus = "locked" | "unlocked";

export type MilestoneBadgeDisplayStatus = "locked" | "ready" | "minted";

export type MilestoneBadgeMintRecord = {
  minted: boolean;
  tokenId?: number;
  mintTx?: string;
};

export type MilestoneBadgeMintStatusMap = Record<string, MilestoneBadgeMintRecord>;

export type MilestoneBadgeContext = {
  reputation: number;
  passportMinted: boolean;
  attendanceVerified: boolean;
  communityId?: string;
  email?: string;
  meetupId?: string;
  mintedBadges?: MilestoneBadgeMintStatusMap;
};

export const MILESTONE_BADGE_DEFINITIONS: MilestoneBadgeDefinition[] = [
  {
    id: "betterdev-passport",
    name: "BetterDev Passport",
    threshold: 0,
    description: "Minted once as the member's on-chain BetterDev identity.",
    tier: "passport",
    image: "/badges/betterdev-passport.png",
    unlockHint: "Join BetterDev, connect a wallet, and mint your Passport.",
    requirementLabel: "Identity",
    futureBenefits: ["Portable member ID", "On-chain reputation anchor", "Future partner access"],
    mintKind: "identity",
  },
  {
    id: "first-meetup",
    name: "First Meetup Stamp",
    threshold: 20,
    description: "Unlocked after the first verified meetup attendance.",
    tier: "silver",
    image: "/badges/first-meetup-stamp.png",
    unlockHint: "Verify attendance at your first BetterDev meetup.",
    requirementLabel: "20+ Rep",
    futureBenefits: ["Verified attendance proof", "Event priority (coming soon)", "Meetup NFT stamp"],
    mintKind: "meetup",
  },
  {
    id: "community-builder",
    name: "Community Builder",
    threshold: 100,
    description: "Unlocked after consistent participation and contribution.",
    tier: "gold",
    image: "/badges/community-builder.png",
    unlockHint: "Keep attending meetups, contributing, and earning reputation.",
    requirementLabel: "100+ Rep",
    futureBenefits: ["Contributor recognition", "Mentorship access (coming soon)", "Grant eligibility"],
    mintKind: "milestone",
  },
  {
    id: "community-champion",
    name: "Community Champion",
    threshold: 250,
    description: "Unlocked for members who help grow BetterDev across chapters.",
    tier: "diamond",
    image: "/badges/community-champion.png",
    unlockHint: "Grow the network through referrals, recaps, and chapter support.",
    requirementLabel: "250+ Rep",
    futureBenefits: ["Ambassador status", "Global chapter perks (coming soon)", "Premium milestone NFT"],
    mintKind: "milestone",
  },
];

/** @deprecated Import MILESTONE_BADGE_DEFINITIONS or MILESTONE_BADGES from this module. */
export const MILESTONE_BADGES = MILESTONE_BADGE_DEFINITIONS.map(({ id, name, threshold, description }) => ({
  id,
  name,
  threshold,
  description,
}));

export function getMilestoneBadgeById(badgeId: string): MilestoneBadgeDefinition | undefined {
  return MILESTONE_BADGE_DEFINITIONS.find((badge) => badge.id === badgeId);
}

export function badgeIdToBytes32(badgeId: string): string {
  return id(badgeId);
}

export function isMilestoneBadgeMinted(
  badge: MilestoneBadgeDefinition,
  context: MilestoneBadgeContext,
): boolean {
  const record = context.mintedBadges?.[badge.id];
  if (record?.minted) return true;

  if (badge.id === "betterdev-passport") return context.passportMinted;
  return false;
}

export function getMilestoneBadgeEligibility(
  badge: MilestoneBadgeDefinition,
  context: MilestoneBadgeContext,
): MilestoneBadgeEligibility {
  if (badge.id === "betterdev-passport") {
    return context.communityId ? "eligible" : "locked";
  }
  if (badge.id === "first-meetup") {
    return context.attendanceVerified || context.reputation >= badge.threshold ? "eligible" : "locked";
  }
  return context.reputation >= badge.threshold ? "eligible" : "locked";
}

export function getMilestoneBadgeDisplayStatus(
  badge: MilestoneBadgeDefinition,
  context: MilestoneBadgeContext,
): MilestoneBadgeDisplayStatus {
  if (isMilestoneBadgeMinted(badge, context)) return "minted";
  if (getMilestoneBadgeEligibility(badge, context) === "eligible") return "ready";
  return "locked";
}

/** @deprecated Use getMilestoneBadgeEligibility or getMilestoneBadgeDisplayStatus. */
export function getMilestoneBadgeUnlockStatus(
  badge: MilestoneBadgeDefinition,
  context: MilestoneBadgeContext,
): MilestoneBadgeUnlockStatus {
  const display = getMilestoneBadgeDisplayStatus(badge, context);
  if (display === "locked") return "locked";
  return "unlocked";
}

export function countUnlockedMilestoneBadges(context: MilestoneBadgeContext): number {
  return MILESTONE_BADGE_DEFINITIONS.filter((badge) => {
    const status = getMilestoneBadgeDisplayStatus(badge, context);
    return status === "ready" || status === "minted";
  }).length;
}

export function countMintedMilestoneBadges(context: MilestoneBadgeContext): number {
  return MILESTONE_BADGE_DEFINITIONS.filter((badge) => isMilestoneBadgeMinted(badge, context)).length;
}

export function getNextMilestoneBadge(
  context: MilestoneBadgeContext,
): { badge: MilestoneBadgeDefinition; repRemaining: number } | null {
  for (const badge of MILESTONE_BADGE_DEFINITIONS) {
    const status = getMilestoneBadgeDisplayStatus(badge, context);
    if (status === "locked" || status === "ready") {
      if (badge.id === "betterdev-passport") {
        return status === "ready" ? { badge, repRemaining: 0 } : { badge, repRemaining: 0 };
      }
      if (status === "ready") {
        return { badge, repRemaining: 0 };
      }
      return { badge, repRemaining: Math.max(0, badge.threshold - context.reputation) };
    }
  }
  return null;
}

export function getMilestoneProgressTarget(context: MilestoneBadgeContext): number {
  const next = getNextMilestoneBadge(context);
  if (!next) return MILESTONE_BADGE_DEFINITIONS.at(-1)?.threshold ?? 250;
  if (next.badge.id === "betterdev-passport") return 0;
  return next.badge.threshold;
}

export const TIER_STYLES: Record<
  MilestoneBadgeTier,
  { ring: string; glow: string; label: string }
> = {
  passport: {
    ring: "border-brand-sky/40",
    glow: "shadow-[0_0_40px_-12px_rgba(56,189,248,0.55)]",
    label: "Identity tier",
  },
  silver: {
    ring: "border-slate-400/40",
    glow: "shadow-[0_0_40px_-12px_rgba(148,163,184,0.45)]",
    label: "Silver tier",
  },
  gold: {
    ring: "border-amber-400/40",
    glow: "shadow-[0_0_40px_-12px_rgba(251,191,36,0.45)]",
    label: "Gold tier",
  },
  diamond: {
    ring: "border-cyan-200/40",
    glow: "shadow-[0_0_44px_-10px_rgba(165,243,252,0.55)]",
    label: "Champion tier",
  },
};

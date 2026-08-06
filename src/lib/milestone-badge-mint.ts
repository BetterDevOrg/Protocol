import {
  getMilestoneBadgeById,
  getMilestoneBadgeEligibility,
  MILESTONE_BADGE_DEFINITIONS,
  type MilestoneBadgeContext,
} from "@/lib/milestone-badges";
import { encodeCommunityIdForMetadata } from "@/lib/relayer";

export function buildMilestoneBadgeMetadataUri(
  origin: string,
  badgeId: string,
  communityId: string,
): string {
  const encodedCommunityId = encodeCommunityIdForMetadata(communityId);
  return `${origin}/api/badges/${encodeURIComponent(badgeId)}/metadata/${encodedCommunityId}`;
}

export function assertMilestoneBadgeMintEligible(
  badgeId: string,
  context: MilestoneBadgeContext,
): { ok: true } | { ok: false; error: string } {
  const badge = getMilestoneBadgeById(badgeId);
  if (!badge) {
    return { ok: false, error: "Unknown milestone badge." };
  }

  if (getMilestoneBadgeEligibility(badge, context) !== "eligible") {
    return { ok: false, error: "Milestone requirements are not met yet." };
  }

  if (badge.mintKind === "identity" && !context.email?.includes("@")) {
    return { ok: false, error: "Valid member email is required." };
  }

  if (badge.mintKind === "meetup" && !context.meetupId?.trim()) {
    return { ok: false, error: "Meetup ID is required for this badge." };
  }

  if (!context.communityId?.trim()) {
    return { ok: false, error: "Community ID is required." };
  }

  return { ok: true };
}

export const MILESTONE_MINT_BADGE_IDS = MILESTONE_BADGE_DEFINITIONS.map((badge) => badge.id);

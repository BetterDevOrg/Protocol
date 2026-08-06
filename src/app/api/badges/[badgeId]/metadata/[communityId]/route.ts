import { getMilestoneBadgeById } from "@/lib/milestone-badges";
import { decodeCommunityIdFromMetadata } from "@/lib/relayer";
import { lookupMemberByCommunityId } from "@/lib/member-lookup";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ badgeId: string; communityId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { badgeId: rawBadgeId, communityId: rawCommunityId } = await context.params;
  const badgeId = rawBadgeId.trim().toLowerCase();
  const communityId = decodeCommunityIdFromMetadata(rawCommunityId);
  const badge = getMilestoneBadgeById(badgeId);

  if (!badge || badge.mintKind === "meetup") {
    return NextResponse.json({ error: "Badge metadata not found." }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const member = await lookupMemberByCommunityId(communityId, origin);
  const imageUrl = `${origin}${badge.image}`;

  return NextResponse.json({
    name: `${badge.name} — ${communityId}`,
    description: badge.description,
    image: imageUrl,
    external_url: `${origin}/profile`,
    attributes: [
      { trait_type: "Community ID", value: communityId },
      { trait_type: "Badge", value: badge.name },
      { trait_type: "Tier", value: badge.tier },
      { trait_type: "Requirement", value: badge.requirementLabel },
      { trait_type: "Protocol", value: "BetterDev Milestone Badge" },
      { trait_type: "Network", value: "Arbitrum Sepolia" },
      ...(member?.city ? [{ trait_type: "City", value: member.city }] : []),
    ],
  });
}

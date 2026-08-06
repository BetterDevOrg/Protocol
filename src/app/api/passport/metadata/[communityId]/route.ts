import { decodeCommunityIdFromMetadata } from "@/lib/relayer";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ communityId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { communityId: rawId } = await context.params;
  const communityId = decodeCommunityIdFromMetadata(rawId);
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    name: `BetterDev Passport — ${communityId}`,
    description: "Verified BetterDev member credential for real-world engineering communities.",
    image: `${origin}/badges/betterdev-passport.png`,
    external_url: `${origin}/meetup`,
    attributes: [
      { trait_type: "Community ID", value: communityId },
      { trait_type: "Protocol", value: "BetterDev Passport" },
      { trait_type: "Network", value: "Arbitrum Sepolia" },
    ],
  });
}

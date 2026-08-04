import { formatMemberJoinedLabel, resolveMeetupPassportContext } from "@/lib/meetup-passport";
import { buildPassportCardSvg } from "@/lib/passport-card-svg";
import { decodeCommunityIdFromMetadata, readMemberOnChainStatus } from "@/lib/relayer";
import { lookupMemberByCommunityId } from "@/lib/member-lookup";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ meetupId: string; communityId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { meetupId: rawMeetupId, communityId: rawCommunityId } = await context.params;
  const meetupId = rawMeetupId.trim().toLowerCase();
  const communityId = decodeCommunityIdFromMetadata(rawCommunityId);

  const origin = new URL(_request.url).origin;
  const [member, meetup, chainStatus] = await Promise.all([
    lookupMemberByCommunityId(communityId, origin),
    resolveMeetupPassportContext(meetupId),
    readMemberOnChainStatus(communityId, meetupId),
  ]);

  const svg = buildPassportCardSvg({
    communityId,
    fullName: member?.fullName ?? "",
    role: meetup.eventLabel,
    city: member?.city ?? meetup.meetupCity ?? "",
    joinedLabel: formatMemberJoinedLabel(member?.joinDate),
    reputation: chainStatus.onChainReputation || member?.reputation || 0,
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300",
    },
  });
}

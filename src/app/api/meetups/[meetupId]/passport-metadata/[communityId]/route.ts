import { formatMemberJoinedLabel, resolveMeetupPassportContext } from "@/lib/meetup-passport";
import { decodeCommunityIdFromMetadata } from "@/lib/relayer";
import { lookupMemberByCommunityId } from "@/lib/member-lookup";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ meetupId: string; communityId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { meetupId: rawMeetupId, communityId: rawCommunityId } = await context.params;
  const meetupId = rawMeetupId.trim().toLowerCase();
  const communityId = decodeCommunityIdFromMetadata(rawCommunityId);

  const origin = new URL(_request.url).origin;
  const member = await lookupMemberByCommunityId(communityId, origin);
  const meetup = await resolveMeetupPassportContext(meetupId);

  const imageUrl = `${origin}/api/meetups/${encodeURIComponent(meetupId)}/passport-image/${encodeURIComponent(communityId)}`;

  return NextResponse.json({
    name: `BetterDev Meetup Passport — ${meetup.eventLabel}`,
    description: `Verified attendance at ${meetup.meetupName} by ${member?.fullName ?? communityId}.`,
    image: imageUrl,
    external_url: `${origin}/meetup`,
    attributes: [
      { trait_type: "Community ID", value: communityId },
      { trait_type: "Event", value: meetup.meetupName },
      { trait_type: "Event Label", value: meetup.eventLabel },
      { trait_type: "Meetup ID", value: meetupId },
      { trait_type: "Protocol", value: "BetterDev Meetup Passport" },
      { trait_type: "Network", value: "Arbitrum Sepolia" },
      ...(member?.city ? [{ trait_type: "City", value: member.city }] : []),
      ...(member?.joinDate
        ? [{ trait_type: "Joined", value: formatMemberJoinedLabel(member.joinDate) }]
        : []),
    ],
  });
}

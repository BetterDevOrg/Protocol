import { getEventMeetupId } from "@/lib/event-config";
import { lookupMemberByEmail } from "@/lib/member-lookup";
import { readMemberOnChainStatus } from "@/lib/relayer";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email")?.trim().toLowerCase() ?? "";
    const walletAddress = url.searchParams.get("wallet")?.trim() ?? "";
    const meetupId = url.searchParams.get("meetupId")?.trim() || getEventMeetupId();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const origin = url.origin;
    const member = await lookupMemberByEmail(email, origin);
    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    const onChain = await readMemberOnChainStatus(
      member.communityId,
      meetupId,
      walletAddress || undefined,
    );

    return NextResponse.json({
      member: {
        communityId: member.communityId,
        fullName: member.fullName,
        email: member.email,
        offChainReputation: member.reputation,
      },
      onChain,
    });
  } catch (e) {
    console.error("[members/on-chain-status]", e);
    const message = e instanceof Error ? e.message : "Could not load on-chain status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

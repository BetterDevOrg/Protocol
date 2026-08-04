import { isMeetupPassportConfigured } from "@/contracts/config";
import { buildMeetupPassportMetadataUri } from "@/lib/meetup-passport";
import { normalizeCommunityId, validateCommunityId } from "@/lib/community-id";
import { lookupMemberByCommunityId } from "@/lib/member-lookup";
import {
  mintMeetupPassportForMember,
  readMeetupPassportStatus,
  readMemberOnChainStatus,
} from "@/lib/relayer";
import { isAddress } from "ethers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      communityId?: string;
      meetupId?: string;
      walletAddress?: string;
    };

    const communityId = normalizeCommunityId(body.communityId ?? "");
    const meetupId = body.meetupId?.trim().toLowerCase() ?? "";
    const walletAddress = body.walletAddress?.trim() ?? "";

    const communityIdError = validateCommunityId(communityId);
    if (communityIdError) {
      return NextResponse.json({ error: communityIdError }, { status: 400 });
    }
    if (!meetupId) {
      return NextResponse.json({ error: "Meetup ID is required." }, { status: 400 });
    }
    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json({ error: "Valid wallet address is required." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const member = await lookupMemberByCommunityId(communityId, origin);
    if (!member) {
      return NextResponse.json(
        { error: "Member not found. Register at BetterDev first." },
        { status: 404 },
      );
    }

    if (!isMeetupPassportConfigured()) {
      return NextResponse.json({
        ok: true,
        demo: true,
        alreadyMinted: false,
        communityId,
        meetupId,
        tokenId: 1,
        mintTx: "demo-meetup-passport",
      });
    }

    const [attendance, existing] = await Promise.all([
      readMemberOnChainStatus(communityId, meetupId),
      readMeetupPassportStatus(communityId, meetupId),
    ]);

    if (!attendance.hasAttended) {
      return NextResponse.json(
        { error: "Attendance must be verified before minting a meetup passport." },
        { status: 403 },
      );
    }

    if (existing.minted) {
      return NextResponse.json({
        ok: true,
        alreadyMinted: true,
        communityId,
        meetupId,
        tokenId: existing.tokenId,
      });
    }

    const metadataURI = buildMeetupPassportMetadataUri(origin, meetupId, communityId);
    const { mintTx, tokenId } = await mintMeetupPassportForMember(
      walletAddress,
      communityId,
      meetupId,
      metadataURI,
    );

    return NextResponse.json({
      ok: true,
      alreadyMinted: false,
      communityId,
      meetupId,
      tokenId,
      mintTx,
    });
  } catch (e) {
    console.error("[passport/mint-meetup]", e);
    const message = e instanceof Error ? e.message : "Could not mint meetup passport.";
    const status = message.includes("not configured") || message.includes("Missing") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const communityId = normalizeCommunityId(searchParams.get("communityId") ?? "");
    const meetupId = searchParams.get("meetupId")?.trim().toLowerCase() ?? "";

    const communityIdError = validateCommunityId(communityId);
    if (communityIdError) {
      return NextResponse.json({ error: communityIdError }, { status: 400 });
    }
    if (!meetupId) {
      return NextResponse.json({ error: "Meetup ID is required." }, { status: 400 });
    }

    if (!isMeetupPassportConfigured()) {
      return NextResponse.json({
        configured: false,
        minted: false,
        tokenId: 0,
      });
    }

    const status = await readMeetupPassportStatus(communityId, meetupId);
    return NextResponse.json({
      configured: true,
      minted: status.minted,
      tokenId: status.tokenId,
    });
  } catch (e) {
    console.error("[passport/mint-meetup GET]", e);
    const message = e instanceof Error ? e.message : "Could not load meetup passport status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

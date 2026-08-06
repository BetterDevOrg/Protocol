import { isMeetupPassportConfigured, isMilestoneBadgeConfigured } from "@/contracts/config";
import { getEventMeetupId } from "@/lib/event-config";
import {
  buildMilestoneBadgeMetadataUri,
  MILESTONE_MINT_BADGE_IDS,
} from "@/lib/milestone-badge-mint";
import {
  getMilestoneBadgeById,
  isMilestoneBadgeMinted,
  type MilestoneBadgeMintStatusMap,
} from "@/lib/milestone-badges";
import { buildMeetupPassportMetadataUri } from "@/lib/meetup-passport";
import { normalizeCommunityId, validateCommunityId } from "@/lib/community-id";
import { lookupMemberByCommunityId, lookupMemberByEmail } from "@/lib/member-lookup";
import {
  encodeCommunityIdForMetadata,
  mintMeetupPassportForMember,
  mintMilestoneBadgeForMember,
  mintPassportForMember,
  readMeetupPassportStatus,
  readMemberOnChainStatus,
  readMilestoneBadgeStatus,
  readWalletPassportStatus,
} from "@/lib/relayer";
import { isAddress } from "ethers";
import { NextResponse } from "next/server";

async function resolveMintContext(input: {
  origin: string;
  email?: string;
  communityId?: string;
  meetupId?: string;
}): Promise<
  | {
      ok: true;
      communityId: string;
      email: string;
      meetupId: string;
      reputation: number;
      passportMinted: boolean;
      attendanceVerified: boolean;
    }
  | { ok: false; error: string; status: number }
> {
  let communityId = normalizeCommunityId(input.communityId ?? "");
  let email = input.email?.trim().toLowerCase() ?? "";
  const meetupId = input.meetupId?.trim().toLowerCase() || getEventMeetupId();

  if (!communityId && email.includes("@")) {
    const member = await lookupMemberByEmail(email, input.origin);
    if (!member) {
      return { ok: false, error: "Member not found. Register at BetterDev first.", status: 404 };
    }
    communityId = member.communityId ?? "";
    email = member.email ?? email;
  }

  const communityIdError = validateCommunityId(communityId);
  if (communityIdError) {
    return { ok: false, error: communityIdError, status: 400 };
  }

  const member = await lookupMemberByCommunityId(communityId, input.origin);
  if (!member) {
    return { ok: false, error: "Member not found. Register at BetterDev first.", status: 404 };
  }

  const onChain = await readMemberOnChainStatus(communityId, meetupId);
  const reputation = Math.max(member.reputation, onChain.onChainReputation);

  return {
    ok: true,
    communityId,
    email: email || member.email || "",
    meetupId,
    reputation,
    passportMinted: onChain.passportMinted,
    attendanceVerified: onChain.hasAttended,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      badgeId?: string;
      communityId?: string;
      email?: string;
      meetupId?: string;
      walletAddress?: string;
    };

    const badgeId = body.badgeId?.trim() ?? "";
    const walletAddress = body.walletAddress?.trim() ?? "";
    const badge = getMilestoneBadgeById(badgeId);

    if (!badge) {
      return NextResponse.json({ error: "Unknown milestone badge." }, { status: 400 });
    }
    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json({ error: "Valid wallet address is required." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const resolved = await resolveMintContext({
      origin,
      email: body.email,
      communityId: body.communityId,
      meetupId: body.meetupId,
    });
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status });
    }

    if (badge.mintKind === "identity") {
      const walletStatus = await readWalletPassportStatus(walletAddress);
      if (walletStatus.minted) {
        return NextResponse.json({
          ok: true,
          alreadyMinted: true,
          badgeId,
          communityId: resolved.communityId,
          tokenId: walletStatus.tokenId,
        });
      }

      if (resolved.passportMinted) {
        const memberStatus = await readMemberOnChainStatus(resolved.communityId, "", walletAddress);
        return NextResponse.json({
          ok: true,
          alreadyMinted: true,
          badgeId,
          communityId: resolved.communityId,
          tokenId: memberStatus.tokenId,
        });
      }

      if (!process.env.NEXT_PUBLIC_BETTERDEV_PASSPORT_ADDRESS) {
        return NextResponse.json({
          ok: true,
          demo: true,
          alreadyMinted: false,
          badgeId,
          communityId: resolved.communityId,
          tokenId: 1,
          mintTx: "demo-passport",
        });
      }

      const metadataURI = `${origin}/api/passport/metadata/${encodeCommunityIdForMetadata(resolved.communityId)}`;
      const { mintTx, tokenId } = await mintPassportForMember(
        walletAddress,
        resolved.communityId,
        metadataURI,
      );

      return NextResponse.json({
        ok: true,
        alreadyMinted: false,
        badgeId,
        communityId: resolved.communityId,
        tokenId,
        mintTx,
      });
    }

    if (badge.mintKind === "meetup") {
      if (!isMeetupPassportConfigured()) {
        return NextResponse.json({
          ok: true,
          demo: true,
          alreadyMinted: false,
          badgeId,
          communityId: resolved.communityId,
          meetupId: resolved.meetupId,
          tokenId: 1,
          mintTx: "demo-meetup-passport",
        });
      }

      if (!resolved.attendanceVerified) {
        return NextResponse.json(
          { error: "Attendance must be verified before minting a meetup stamp." },
          { status: 403 },
        );
      }

      const existing = await readMeetupPassportStatus(resolved.communityId, resolved.meetupId);
      if (existing.minted) {
        return NextResponse.json({
          ok: true,
          alreadyMinted: true,
          badgeId,
          communityId: resolved.communityId,
          meetupId: resolved.meetupId,
          tokenId: existing.tokenId,
        });
      }

      const metadataURI = buildMeetupPassportMetadataUri(origin, resolved.meetupId, resolved.communityId);
      const { mintTx, tokenId } = await mintMeetupPassportForMember(
        walletAddress,
        resolved.communityId,
        resolved.meetupId,
        metadataURI,
      );

      return NextResponse.json({
        ok: true,
        alreadyMinted: false,
        badgeId,
        communityId: resolved.communityId,
        meetupId: resolved.meetupId,
        tokenId,
        mintTx,
      });
    }

    if (!isMilestoneBadgeConfigured()) {
      return NextResponse.json({
        ok: true,
        demo: true,
        alreadyMinted: false,
        badgeId,
        communityId: resolved.communityId,
        tokenId: 1,
        mintTx: "demo-milestone-badge",
      });
    }

    if (resolved.reputation < badge.threshold) {
      return NextResponse.json(
        { error: `Requires at least ${badge.threshold} reputation to mint this badge.` },
        { status: 403 },
      );
    }

    const existing = await readMilestoneBadgeStatus(badgeId, resolved.communityId);
    if (existing.minted) {
      return NextResponse.json({
        ok: true,
        alreadyMinted: true,
        badgeId,
        communityId: resolved.communityId,
        tokenId: existing.tokenId,
      });
    }

    const metadataURI = buildMilestoneBadgeMetadataUri(origin, badgeId, resolved.communityId);
    const { mintTx, tokenId } = await mintMilestoneBadgeForMember(
      walletAddress,
      resolved.communityId,
      badgeId,
      metadataURI,
    );

    return NextResponse.json({
      ok: true,
      alreadyMinted: false,
      badgeId,
      communityId: resolved.communityId,
      tokenId,
      mintTx,
    });
  } catch (e) {
    console.error("[badges/mint]", e);
    const message = e instanceof Error ? e.message : "Could not mint milestone badge.";
    const status = message.includes("not configured") || message.includes("Missing") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
    const communityIdParam = normalizeCommunityId(searchParams.get("communityId") ?? "");
    const meetupId = searchParams.get("meetupId")?.trim().toLowerCase() || getEventMeetupId();
    const origin = new URL(request.url).origin;

    let communityId = communityIdParam;
    if (!communityId && email.includes("@")) {
      const member = await lookupMemberByEmail(email, origin);
      if (!member) {
        return NextResponse.json({ error: "Member not found." }, { status: 404 });
      }
      communityId = member.communityId;
    }

    const communityIdError = validateCommunityId(communityId);
    if (communityIdError) {
      return NextResponse.json({ error: communityIdError }, { status: 400 });
    }

    const member = await lookupMemberByCommunityId(communityId, origin);
    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    const onChain = await readMemberOnChainStatus(communityId, meetupId);
    const reputation = Math.max(member.reputation, onChain.onChainReputation);
    const mintedBadges: MilestoneBadgeMintStatusMap = {};

    mintedBadges["betterdev-passport"] = {
      minted: onChain.passportMinted,
      tokenId: onChain.tokenId,
    };

    if (isMeetupPassportConfigured()) {
      const meetupStatus = await readMeetupPassportStatus(communityId, meetupId);
      mintedBadges["first-meetup"] = {
        minted: meetupStatus.minted,
        tokenId: meetupStatus.tokenId,
      };
    }

    if (isMilestoneBadgeConfigured()) {
      for (const badgeId of ["community-builder", "community-champion"]) {
        const status = await readMilestoneBadgeStatus(badgeId, communityId);
        mintedBadges[badgeId] = status;
      }
    }

    const context = {
      reputation,
      passportMinted: onChain.passportMinted,
      attendanceVerified: onChain.hasAttended,
      communityId,
      email: member.email,
      meetupId,
      mintedBadges,
    };

    const badges = Object.fromEntries(
      MILESTONE_MINT_BADGE_IDS.map((id) => {
        const badge = getMilestoneBadgeById(id)!;
        return [
          id,
          {
            minted: isMilestoneBadgeMinted(badge, context),
            tokenId: mintedBadges[id]?.tokenId ?? 0,
            mintKind: badge.mintKind,
          },
        ];
      }),
    );

    return NextResponse.json({
      communityId,
      email: member.email,
      meetupId,
      reputation,
      passportMinted: onChain.passportMinted,
      attendanceVerified: onChain.hasAttended,
      badges,
    });
  } catch (e) {
    console.error("[badges/mint GET]", e);
    const message = e instanceof Error ? e.message : "Could not load milestone badge status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

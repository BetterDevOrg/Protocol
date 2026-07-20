import { lookupMemberByEmail } from "@/lib/member-lookup";
import {
  encodeCommunityIdForMetadata,
  mintPassportForMember,
  readMemberOnChainStatus,
  readWalletPassportStatus,
} from "@/lib/relayer";
import { isAddress } from "ethers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; walletAddress?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    const walletAddress = body.walletAddress?.trim() ?? "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json({ error: "Valid wallet address is required." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const member = await lookupMemberByEmail(email, origin);
    if (!member) {
      return NextResponse.json(
        { error: "Member not found. Register at BetterDev first." },
        { status: 404 },
      );
    }

    const walletStatus = await readWalletPassportStatus(walletAddress);
    if (walletStatus.minted) {
      return NextResponse.json({
        ok: true,
        alreadyMinted: true,
        communityId: walletStatus.memberId,
        tokenId: walletStatus.tokenId,
      });
    }

    const memberStatus = await readMemberOnChainStatus(member.communityId, "", walletAddress);
    if (memberStatus.passportMinted) {
      return NextResponse.json({
        ok: true,
        alreadyMinted: true,
        communityId: member.communityId,
        tokenId: memberStatus.tokenId,
      });
    }

    const metadataURI = `${origin}/api/passport/metadata/${encodeCommunityIdForMetadata(member.communityId)}`;
    const { mintTx, tokenId } = await mintPassportForMember(
      walletAddress,
      member.communityId,
      metadataURI,
    );

    return NextResponse.json({
      ok: true,
      alreadyMinted: false,
      communityId: member.communityId,
      tokenId,
      mintTx,
    });
  } catch (e) {
    console.error("[passport/mint]", e);
    const message = e instanceof Error ? e.message : "Could not mint passport.";
    const status = message.includes("not configured") || message.includes("Missing") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

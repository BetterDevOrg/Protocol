import { getEventMeetupId } from "@/lib/event-config";
import { readMemberOnChainStatus, readWalletPassportStatus } from "@/lib/relayer";
import { areBetterDevContractsConfigured } from "@/contracts/config";
import { isAddress } from "ethers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const walletAddress = new URL(request.url).searchParams.get("wallet")?.trim() ?? "";

    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json({ error: "Valid wallet address is required." }, { status: 400 });
    }

    if (!areBetterDevContractsConfigured()) {
      return NextResponse.json({ minted: false, tokenId: 0, communityId: "" });
    }

    const walletStatus = await readWalletPassportStatus(walletAddress);
    if (!walletStatus.minted) {
      return NextResponse.json({ minted: false, tokenId: 0, communityId: "" });
    }

    const meetupId = getEventMeetupId();
    const onChain = await readMemberOnChainStatus(
      walletStatus.memberId,
      meetupId,
      walletAddress,
    );

    return NextResponse.json({
      minted: true,
      tokenId: walletStatus.tokenId,
      communityId: walletStatus.memberId,
      onChainReputation: onChain.onChainReputation,
      hasAttended: onChain.hasAttended,
    });
  } catch (e) {
    console.error("[passport/wallet-status]", e);
    const message = e instanceof Error ? e.message : "Could not load wallet passport status.";
    const status = message.includes("not configured") || message.includes("Missing") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

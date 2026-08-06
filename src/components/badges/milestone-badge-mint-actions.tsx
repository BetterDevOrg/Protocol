"use client";

import { transactionExplorerUrl } from "@/lib/contracts";
import { shortWalletAddress, useEthereumWallet } from "@/hooks/use-ethereum-wallet";
import {
  getMilestoneBadgeDisplayStatus,
  type MilestoneBadgeContext,
  type MilestoneBadgeDefinition,
} from "@/lib/milestone-badges";
import { useCallback, useState } from "react";

type MilestoneBadgeMintActionsProps = {
  badge: MilestoneBadgeDefinition;
  context: MilestoneBadgeContext;
  onMintSuccess?: (badgeId: string, tokenId: number, mintTx?: string) => void;
};

function demoMilestoneBadgeStorageKey(address: string, badgeId: string): string {
  return `betterdev-milestone-badge:${address.toLowerCase()}:${badgeId.toLowerCase()}`;
}

function readDemoMilestoneBadge(address: string, badgeId: string): { tokenId: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(demoMilestoneBadgeStorageKey(address, badgeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { tokenId?: number };
    return { tokenId: parsed.tokenId ?? 1 };
  } catch {
    return null;
  }
}

function writeDemoMilestoneBadge(address: string, badgeId: string, tokenId: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    demoMilestoneBadgeStorageKey(address, badgeId),
    JSON.stringify({ tokenId }),
  );
}

export function MilestoneBadgeMintActions({
  badge,
  context,
  onMintSuccess,
}: MilestoneBadgeMintActionsProps) {
  const displayStatus = getMilestoneBadgeDisplayStatus(badge, context);
  const { status: walletStatus, address, error: walletError, connect, disconnect, isConnected } =
    useEthereumWallet();
  const [mintSubmitting, setMintSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mintTx, setMintTx] = useState(context.mintedBadges?.[badge.id]?.mintTx ?? null);
  const tokenId = context.mintedBadges?.[badge.id]?.tokenId;

  const mintBadge = useCallback(async () => {
    setError(null);

    if (!context.communityId?.trim()) {
      setError("Sign in or enter your registered email on the Passport page first.");
      return;
    }

    let wallet = address;
    if (!wallet) {
      wallet = (await connect()) ?? "";
      if (!wallet) return;
    }

    setMintSubmitting(true);
    try {
      const res = await fetch("/api/badges/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          badgeId: badge.id,
          communityId: context.communityId,
          email: context.email,
          meetupId: context.meetupId,
          walletAddress: wallet,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        ok?: boolean;
        alreadyMinted?: boolean;
        demo?: boolean;
        tokenId?: number;
        mintTx?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Milestone badge mint failed.");

      const nextTokenId = data.tokenId ?? tokenId ?? 1;
      if (data.mintTx) setMintTx(data.mintTx);
      if (data.demo) writeDemoMilestoneBadge(wallet, badge.id, nextTokenId);
      onMintSuccess?.(badge.id, nextTokenId, data.mintTx);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mint milestone badge.");
    } finally {
      setMintSubmitting(false);
    }
  }, [
    address,
    badge.id,
    connect,
    context.communityId,
    context.email,
    context.meetupId,
    onMintSuccess,
    tokenId,
  ]);

  if (displayStatus === "locked") return null;

  if (displayStatus === "minted") {
    return (
      <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-[11px] text-emerald-200">
        Owned{tokenId ? ` · token #${tokenId}` : ""}.
        {mintTx && !mintTx.startsWith("demo-") ? (
          <>
            {" "}
            <a
              href={transactionExplorerUrl(mintTx)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-sky hover:text-white"
            >
              View mint
            </a>
          </>
        ) : null}
      </div>
    );
  }

  const displayError = error ?? walletError;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-[11px] leading-relaxed text-zinc-400">
        Badge ready — mint as an NFT to your wallet.
      </p>

      {isConnected ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[11px]">
          <span className="text-zinc-500">
            Wallet{" "}
            <span className="font-mono font-bold text-white">{shortWalletAddress(address)}</span>
          </span>
          <button
            type="button"
            onClick={disconnect}
            className="font-bold text-zinc-500 hover:text-white"
          >
            Disconnect
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void mintBadge()}
        disabled={mintSubmitting}
        className="w-full rounded-xl bg-brand-sash-diag px-4 py-2.5 text-xs font-black text-white shadow-[0_0_28px_-12px_rgba(233,30,140,0.95)] transition hover:opacity-95 disabled:opacity-60"
      >
        {mintSubmitting
          ? "Minting…"
          : isConnected
            ? "Mint milestone NFT"
            : walletStatus === "connecting"
              ? "Connecting wallet…"
              : "Connect wallet & mint"}
      </button>

      {displayError ? (
        <p className="rounded-lg border border-brand-pink/30 bg-brand-pink/10 p-2 text-[11px] text-brand-pink">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}

export { readDemoMilestoneBadge, writeDemoMilestoneBadge };

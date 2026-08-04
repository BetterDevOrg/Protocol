"use client";

import { PassportIdCard } from "@/components/passport/passport-id-card";
import { getBetterDevContractStatus, transactionExplorerUrl } from "@/lib/contracts";
import { shortWalletAddress, useEthereumWallet } from "@/hooks/use-ethereum-wallet";
import { useCallback, useEffect, useState } from "react";

export type MeetupPassportMintState = {
  communityId: string;
  meetupId: string;
  fullName: string;
  city: string;
  joinedLabel: string;
  eventLabel: string;
  reputation: number;
  meetupPassportMinted: boolean;
  meetupPassportTokenId: number;
};

function demoMeetupPassportStorageKey(address: string, meetupId: string): string {
  return `betterdev-meetup-passport:${address.toLowerCase()}:${meetupId.toLowerCase()}`;
}

function readDemoMeetupPassport(address: string, meetupId: string): { tokenId: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(demoMeetupPassportStorageKey(address, meetupId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { tokenId?: number };
    return { tokenId: parsed.tokenId ?? 1 };
  } catch {
    return null;
  }
}

function writeDemoMeetupPassport(address: string, meetupId: string, tokenId: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    demoMeetupPassportStorageKey(address, meetupId),
    JSON.stringify({ tokenId }),
  );
}

export function MeetupPassportMintPanel({ state }: { state: MeetupPassportMintState }) {
  const contractStatus = getBetterDevContractStatus();
  const { status: walletStatus, address, error: walletError, connect, disconnect, isConnected } =
    useEthereumWallet();

  const [minted, setMinted] = useState(state.meetupPassportMinted);
  const [tokenId, setTokenId] = useState(state.meetupPassportTokenId);
  const [mintTx, setMintTx] = useState<string | null>(null);
  const [mintSubmitting, setMintSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMinted(state.meetupPassportMinted);
    setTokenId(state.meetupPassportTokenId);
  }, [state.meetupPassportMinted, state.meetupPassportTokenId]);

  const refreshMintStatus = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        communityId: state.communityId,
        meetupId: state.meetupId,
      });
      const res = await fetch(`/api/passport/mint-meetup?${params.toString()}`, { cache: "no-store" });
      const data = (await res.json()) as { minted?: boolean; tokenId?: number; configured?: boolean };
      if (res.ok && data.configured !== false && data.minted) {
        setMinted(true);
        if (data.tokenId != null) setTokenId(data.tokenId);
      }
    } catch {
      // Non-blocking status refresh.
    }
  }, [state.communityId, state.meetupId]);

  useEffect(() => {
    void refreshMintStatus();
  }, [refreshMintStatus]);

  useEffect(() => {
    if (!isConnected || !address || contractStatus.configured) return;
    const demo = readDemoMeetupPassport(address, state.meetupId);
    if (demo) {
      setMinted(true);
      setTokenId(demo.tokenId);
    }
  }, [isConnected, address, contractStatus.configured, state.meetupId]);

  const mintMeetupPassport = async () => {
    setError(null);

    let wallet = address;
    if (!wallet) {
      wallet = (await connect()) ?? "";
      if (!wallet) return;
    }

    setMintSubmitting(true);
    try {
      const res = await fetch("/api/passport/mint-meetup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: state.communityId,
          meetupId: state.meetupId,
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
      if (!res.ok) throw new Error(data.error ?? "Meetup passport mint failed.");

      setMinted(true);
      setTokenId(data.tokenId ?? tokenId ?? 1);
      if (data.mintTx) setMintTx(data.mintTx);

      if (data.demo || !contractStatus.configured) {
        writeDemoMeetupPassport(wallet, state.meetupId, data.tokenId ?? 1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mint meetup passport.");
    } finally {
      setMintSubmitting(false);
    }
  };

  const displayError = error ?? walletError;

  return (
    <div className="mt-8 space-y-5 border-t border-white/10 pt-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">Meetup passport</p>
        <h2 className="mt-2 text-xl font-black text-white">Your attendance stamp</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Mint an NFT passport for this meetup to your wallet. The card matches your BetterDev identity, with the
          event name and date on the stamp line.
        </p>
      </div>

      <PassportIdCard
        communityId={state.communityId}
        fullName={state.fullName}
        role={state.eventLabel}
        city={state.city}
        joinedLabel={state.joinedLabel}
        reputation={state.reputation}
      />

      {minted ? (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
          Meetup passport minted{tokenId ? ` · token #${tokenId}` : ""}.
          {mintTx && mintTx !== "demo-meetup-passport" ? (
            <>
              {" "}
              <a
                href={transactionExplorerUrl(mintTx)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-brand-sky hover:text-white"
              >
                View mint transaction
              </a>
            </>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {!isConnected ? (
            <button
              type="button"
              onClick={() => void connect()}
              disabled={walletStatus === "connecting"}
              className="w-full rounded-xl border border-brand-sky/30 bg-brand-sky/10 px-5 py-3 text-sm font-black text-brand-sky transition hover:bg-brand-sky/20 disabled:opacity-60"
            >
              {walletStatus === "connecting" ? "Connecting wallet…" : "Connect wallet"}
            </button>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm">
              <span className="text-zinc-400">
                Connected <span className="font-mono font-bold text-white">{shortWalletAddress(address)}</span>
              </span>
              <button
                type="button"
                onClick={disconnect}
                className="text-xs font-bold text-zinc-500 hover:text-white"
              >
                Disconnect
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => void mintMeetupPassport()}
            disabled={mintSubmitting}
            className="w-full rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white shadow-[0_0_36px_-14px_rgba(233,30,140,0.95)] transition hover:opacity-95 disabled:opacity-60"
          >
            {mintSubmitting
              ? "Minting meetup passport…"
              : isConnected
                ? "Mint meetup passport to wallet"
                : "Connect wallet & mint meetup passport"}
          </button>
        </div>
      )}

      {displayError ? (
        <p className="rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-3 text-sm text-brand-pink">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}

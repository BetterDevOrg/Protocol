"use client";

import {
  getBetterDevContractStatus,
  transactionExplorerUrl,
} from "@/lib/contracts";
import {
  CURRENT_DEPLOYMENT,
  DEMO_MEETUP,
  MILESTONE_BADGES,
  REPUTATION_ACTIONS,
} from "@/lib/passport";
import { MilestoneBadgeGrid } from "@/components/badges/milestone-badge-grid";
import type { MilestoneBadgeMintStatusMap } from "@/lib/milestone-badges";
import { PROTOCOL_LAYERS, PROTOCOL_PRINCIPLE } from "@/lib/protocol";
import type { StoredBuilderCircle } from "@/lib/builder-circle-config";
import { BuilderCirclesOrganizerCard } from "@/components/passport/builder-circles-organizer-card";
import { MeetupHubCard } from "@/components/passport/meetup-hub-card";
import { PassportIdCard } from "@/components/passport/passport-id-card";
import { formatJoinMonthYear } from "@/lib/format-date";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type WalletStatus = "idle" | "connecting" | "connected" | "unsupported";
type PassportStep = "connect" | "passport" | "attendance";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const faqItems = [
  {
    question: "What is the BetterDev Passport?",
    answer:
      "The BetterDev Passport is your universal BetterDev identity. It connects your Community ID, linked wallets, and verified participation without making reputation depend on one chain.",
  },
  {
    question: "Do I need a wallet to join BetterDev?",
    answer:
      "No. You can join BetterDev normally without a wallet. A wallet is only needed for the Passport and on-chain participation layer.",
  },
  {
    question: "Can I earn from BetterDev Passport?",
    answer:
      "Yes. The Passport supports future rewards through reputation. As members attend meetups, contribute, publish, refer friends, or help organize, they earn reputation events that can unlock rewards, grants, opportunities, partner benefits, or milestone badges.",
  },
  {
    question: "What are the benefits of the NFT Passport?",
    answer:
      "The BetterDev Passport helps prove membership, verify real-world participation, build portable reputation, and unlock future opportunities across the BetterDev network.",
  },
  {
    question: "What happens when I attend a meetup?",
    answer:
      "At the meetup, an organizer provides a QR code. You scan it, verify attendance, and earn reputation. Major milestones can unlock badges.",
  },
  {
    question: "Will every action mint an NFT?",
    answer:
      "No. Most actions create reputation events. NFTs are reserved for important milestones like Passport, first meetup, organizer badge, or community champion.",
  },
  {
    question: "What can reputation unlock?",
    answer:
      "Reputation can unlock event priority, grants and partner opportunities, ambassador roles, contributor rewards, mentorship access, recognition badges, and future ecosystem benefits.",
  },
  {
    question: "Which blockchain is this built on?",
    answer: `BetterDev is chain-agnostic from the protocol layer. The current deployment is ${CURRENT_DEPLOYMENT.deployment}, with Solana supported in the architecture so identity and reputation remain portable.`,
  },
  {
    question: "How are Builder Circles assigned?",
    answer:
      "City co-leads create a meetup and collect RSVPs, then run fair group assignment from the organizer tools. Attendees are placed in small circles of 4–6 with a mix of roles so networking feels intentional. Behind the scenes, this is powered by Chainlink for transparent proof.",
  },
];

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function demoPassportStorageKey(address: string) {
  return `betterdev-passport-demo:${address.toLowerCase()}`;
}

function readDemoPassport(address: string): { communityId: string; tokenId: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(demoPassportStorageKey(address));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { communityId?: string; tokenId?: number };
    if (!parsed.communityId) return null;
    return { communityId: parsed.communityId, tokenId: parsed.tokenId ?? 1 };
  } catch {
    return null;
  }
}

function writeDemoPassport(address: string, communityId: string, tokenId: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    demoPassportStorageKey(address),
    JSON.stringify({ communityId, tokenId }),
  );
}

function Kicker({ children, tone = "sky" }: { children: string; tone?: "sky" | "pink" | "muted" }) {
  const color = tone === "pink" ? "text-brand-pink" : tone === "muted" ? "text-zinc-600" : "text-brand-sky";
  return <p className={`text-[10px] font-black uppercase tracking-[0.32em] ${color}`}>{children}</p>;
}

function StepCard({
  active,
  index,
  title,
  description,
}: {
  active: boolean;
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        active ? "border-brand-sky/40 bg-brand-sky/10" : "border-white/10 bg-white/[0.035]"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-sky">{index}</p>
      <h3 className="mt-3 text-sm font-bold text-white">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}

function AbstractCube() {
  return (
    <div className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 opacity-[0.08] lg:block">
      <svg width="170" height="170" viewBox="0 0 180 180" fill="none" aria-hidden>
        <path d="M90 15L150 50V120L90 155L30 120V50L90 15Z" stroke="white" strokeWidth="12" />
        <path d="M90 82L150 50M90 82L30 50M90 82V155" stroke="white" strokeWidth="12" />
      </svg>
    </div>
  );
}

function reputationProgressPercent(reputation: number): number {
  const thresholds = MILESTONE_BADGES.map((badge) => badge.threshold)
    .filter((threshold) => threshold > 0)
    .sort((a, b) => a - b);
  const next = thresholds.find((threshold) => threshold > reputation) ?? thresholds.at(-1) ?? 100;
  return Math.min(100, Math.round((reputation / next) * 100));
}

function PipelineProgressBar({ reputation }: { reputation: number }) {
  const percent = reputationProgressPercent(reputation);
  return (
    <div className="mt-4 h-1 rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-brand-sky shadow-[0_0_20px_rgba(56,189,248,0.55)] transition-all duration-700"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function ReputationPipelineCard({
  previewReputation,
  walletConnected,
  walletAddress,
  onMint,
}: {
  previewReputation: number;
  walletConnected: boolean;
  walletAddress: string;
  onMint: () => void;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#17171b] p-7 text-white shadow-[0_24px_80px_-42px_rgba(14,165,233,0.28)] sm:p-9">
      <Kicker tone="pink">Reputation Pipeline</Kicker>
      <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-zinc-400">
        Actions become events. Milestones become NFTs.
      </h2>
      <p className="mt-5 text-sm leading-relaxed text-zinc-500">
        This prevents NFT spam while keeping rewards scalable.
      </p>
      <div className="mt-8 rounded-2xl border border-white/10 bg-black p-6 text-white">
        <Kicker tone="muted">Preview Reputation</Kicker>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-6xl font-black tracking-[-0.08em]">{previewReputation}</span>
          <span className="mb-2 text-sm font-bold uppercase text-zinc-500">Rep</span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Points from profile, attendance, recap, and referral events
        </p>
      </div>
      <div className="mt-7">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-zinc-400">Pipeline Status</span>
          <span className="font-black uppercase text-brand-sky">
            {walletConnected && walletAddress
              ? `Connected // ${shortAddress(walletAddress)}`
              : "Preview // Awaiting wallet"}
          </span>
        </div>
        <PipelineProgressBar reputation={previewReputation} />
      </div>
      {walletConnected ? (
        <button
          type="button"
          onClick={onMint}
          className="mt-6 w-full rounded-xl border border-brand-sky/30 bg-brand-sky/10 px-5 py-3 text-sm font-black text-brand-sky transition hover:bg-brand-sky/20"
        >
          Mint Passport to surface on-chain identity →
        </button>
      ) : (
        <p className="mt-6 text-xs leading-relaxed text-zinc-500">
          Connect a wallet to mint your on-chain Passport and unlock live reputation tracking.
        </p>
      )}
    </div>
  );
}

export function MeetupPassportClient() {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>("idle");
  const [walletAddress, setWalletAddress] = useState("");
  const [step, setStep] = useState<PassportStep>("connect");
  const [passportMinted, setPassportMinted] = useState(false);
  const [attendanceVerified, setAttendanceVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);
  const [passportTokenId, setPassportTokenId] = useState<number | null>(null);
  const [mintSubmitting, setMintSubmitting] = useState(false);
  const [onChainReputation, setOnChainReputation] = useState<number | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [meetupHubLoading, setMeetupHubLoading] = useState(false);
  const [meetupEventName, setMeetupEventName] = useState<string | undefined>();
  const [meetupEventCity, setMeetupEventCity] = useState<string | undefined>();
  const [meetupEventCountry, setMeetupEventCountry] = useState<string | undefined>();
  const [circlesAssigned, setCirclesAssigned] = useState(false);
  const [myCircle, setMyCircle] = useState<StoredBuilderCircle | null>(null);
  const [memberFullName, setMemberFullName] = useState("");
  const [memberCity, setMemberCity] = useState("");
  const [memberJoinDate, setMemberJoinDate] = useState("");
  const [memberOffChainReputation, setMemberOffChainReputation] = useState<number | null>(null);
  const [mintedBadges, setMintedBadges] = useState<MilestoneBadgeMintStatusMap>({});

  const totalPreviewRep = useMemo(
    () =>
      REPUTATION_ACTIONS.filter((action) =>
        ["PROFILE_COMPLETED", "MEETUP_ATTENDED", "RECAP_PUBLISHED", "FRIEND_REFERRED"].includes(action.type),
      ).reduce((sum, action) => sum + action.points, 0),
    [],
  );
  const contractStatus = getBetterDevContractStatus();

  const passportReputation = useMemo(() => {
    if (passportMinted && onChainReputation !== null) return onChainReputation;
    if (memberOffChainReputation !== null) return memberOffChainReputation;
    return totalPreviewRep;
  }, [passportMinted, onChainReputation, memberOffChainReputation, totalPreviewRep]);

  const milestoneBadgeContext = useMemo(
    () => ({
      reputation: passportReputation,
      passportMinted,
      attendanceVerified,
      communityId: communityId || undefined,
      email: memberEmail || undefined,
      meetupId: DEMO_MEETUP.id,
      mintedBadges,
    }),
    [
      passportReputation,
      passportMinted,
      attendanceVerified,
      communityId,
      memberEmail,
      mintedBadges,
    ],
  );

  const refreshMilestoneMintStatus = useCallback(async () => {
    const id = communityId.trim().toUpperCase();
    if (!id) return;

    try {
      const params = new URLSearchParams({
        communityId: id,
        meetupId: DEMO_MEETUP.id,
      });
      if (memberEmail.includes("@")) params.set("email", memberEmail);

      const res = await fetch(`/api/badges/mint?${params.toString()}`, { cache: "no-store" });
      const data = (await res.json()) as {
        badges?: Record<string, { minted: boolean; tokenId: number }>;
      };
      if (!res.ok || !data.badges) return;

      const next: MilestoneBadgeMintStatusMap = {};
      for (const [badgeId, record] of Object.entries(data.badges)) {
        next[badgeId] = { minted: record.minted, tokenId: record.tokenId };
      }
      setMintedBadges(next);
    } catch {
      // Non-blocking badge status refresh.
    }
  }, [communityId, memberEmail]);

  useEffect(() => {
    void refreshMilestoneMintStatus();
  }, [refreshMilestoneMintStatus, passportMinted, attendanceVerified]);

  const handleMilestoneMintSuccess = useCallback(
    (badgeId: string, tokenId: number, mintTx?: string) => {
      setMintedBadges((prev) => ({
        ...prev,
        [badgeId]: { minted: true, tokenId, mintTx },
      }));
      if (badgeId === "betterdev-passport") {
        setPassportMinted(true);
        setPassportTokenId(tokenId);
        if (mintTx) setMintTxHash(mintTx);
      }
    },
    [],
  );

  const passportJoinedLabel = memberJoinDate ? formatJoinMonthYear(memberJoinDate) : undefined;

  const applyWalletPassport = useCallback(
    (data: {
      minted: boolean;
      communityId?: string;
      tokenId?: number;
      onChainReputation?: number;
      hasAttended?: boolean;
    }) => {
      if (!data.minted) {
        setStep("passport");
        return;
      }
      setPassportMinted(true);
      if (data.communityId) setCommunityId(data.communityId);
      if (data.tokenId != null) setPassportTokenId(data.tokenId);
      if (data.onChainReputation != null) setOnChainReputation(data.onChainReputation);
      if (data.hasAttended) setAttendanceVerified(true);
      setStep("attendance");
    },
    [],
  );

  const loadWalletPassportStatus = useCallback(
    async (address: string) => {
      if (!contractStatus.configured) {
        const demo = readDemoPassport(address);
        if (demo) {
          applyWalletPassport({
            minted: true,
            communityId: demo.communityId,
            tokenId: demo.tokenId,
          });
          return true;
        }
        return false;
      }

      try {
        const res = await fetch(
          `/api/passport/wallet-status?wallet=${encodeURIComponent(address)}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as {
          error?: string;
          minted?: boolean;
          communityId?: string;
          tokenId?: number;
          onChainReputation?: number;
          hasAttended?: boolean;
        };
        if (!res.ok) throw new Error(data.error ?? "Could not load wallet passport status.");
        applyWalletPassport({
          minted: Boolean(data.minted),
          communityId: data.communityId,
          tokenId: data.tokenId,
          onChainReputation: data.onChainReputation,
          hasAttended: data.hasAttended,
        });
        return Boolean(data.minted);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load wallet passport status.");
        return false;
      }
    },
    [applyWalletPassport, contractStatus.configured],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          member?: {
            email?: string;
            communityId?: string;
            fullName?: string;
            city?: string;
            joinDate?: string;
            reputation?: number;
          };
        };
        if (cancelled || !data.member) return;
        if (data.member.email) setMemberEmail(data.member.email);
        if (data.member.communityId) setCommunityId(data.member.communityId);
        if (data.member.fullName) setMemberFullName(data.member.fullName);
        if (data.member.city) setMemberCity(data.member.city);
        if (data.member.joinDate) setMemberJoinDate(data.member.joinDate);
        if (typeof data.member.reputation === "number") {
          setMemberOffChainReputation(data.member.reputation);
        }
      } catch {
        // Not signed in — user can enter email manually.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshOnChainStatus = useCallback(async () => {
    if (!memberEmail.includes("@")) return;
    setStatusLoading(true);
    try {
      const params = new URLSearchParams({
        email: memberEmail,
        meetupId: DEMO_MEETUP.id,
      });
      if (walletAddress) params.set("wallet", walletAddress);
      const res = await fetch(`/api/members/on-chain-status?${params.toString()}`);
      const data = (await res.json()) as {
        error?: string;
        member?: { communityId: string };
        onChain?: {
          passportMinted: boolean;
          tokenId: number;
          onChainReputation: number;
          hasAttended: boolean;
        };
      };
      if (!res.ok) throw new Error(data.error ?? "Could not load status.");
      if (data.member?.communityId) setCommunityId(data.member.communityId);
      if (data.onChain) {
        setOnChainReputation(data.onChain.onChainReputation);
        setPassportMinted(data.onChain.passportMinted);
        setPassportTokenId(data.onChain.tokenId || null);
        setAttendanceVerified(data.onChain.hasAttended);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load on-chain status.");
    } finally {
      setStatusLoading(false);
    }
  }, [memberEmail, walletAddress]);

  const loadMeetupHub = useCallback(async () => {
    const id = communityId.trim().toUpperCase();
    if (!id) return;

    setMeetupHubLoading(true);
    try {
      const meetupId = DEMO_MEETUP.id;
      const [rsvpRes, circlesRes] = await Promise.all([
        fetch(`/api/meetups/${encodeURIComponent(meetupId)}/rsvp`, { cache: "no-store" }),
        fetch(
          `/api/meetups/${encodeURIComponent(meetupId)}/builder-circles?communityId=${encodeURIComponent(id)}`,
          { cache: "no-store" },
        ),
      ]);

      const rsvpData = (await rsvpRes.json()) as {
        event?: { name?: string; city?: string; country?: string };
      };
      if (rsvpRes.ok && rsvpData.event) {
        setMeetupEventName(rsvpData.event.name);
        setMeetupEventCity(rsvpData.event.city);
        setMeetupEventCountry(rsvpData.event.country);
      }

      const circlesData = (await circlesRes.json()) as {
        assigned?: boolean;
        myCircle?: StoredBuilderCircle | null;
      };
      if (circlesRes.ok) {
        setCirclesAssigned(Boolean(circlesData.assigned));
        setMyCircle(circlesData.myCircle ?? null);
      } else {
        setCirclesAssigned(false);
        setMyCircle(null);
      }
    } catch {
      setCirclesAssigned(false);
      setMyCircle(null);
    } finally {
      setMeetupHubLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    if (step === "attendance" && memberEmail.includes("@")) {
      void refreshOnChainStatus();
    }
  }, [step, memberEmail, refreshOnChainStatus]);

  useEffect(() => {
    if (walletStatus === "connected" && memberEmail.includes("@")) {
      void refreshOnChainStatus();
    }
  }, [walletStatus, memberEmail, walletAddress, refreshOnChainStatus]);

  useEffect(() => {
    if (step === "attendance" && communityId.trim()) {
      void loadMeetupHub();
    }
  }, [step, communityId, loadMeetupHub]);

  const connectWallet = async () => {
    setError(null);
    if (!window.ethereum) {
      setWalletStatus("unsupported");
      setError("Install a wallet like MetaMask or Rabby to connect to the current Arbitrum deployment.");
      return;
    }

    try {
      setWalletStatus("connecting");
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const account = accounts[0];
      if (!account) throw new Error("No wallet account returned.");
      setWalletAddress(account);
      setWalletStatus("connected");
      await loadWalletPassportStatus(account);
    } catch (e) {
      setWalletStatus("idle");
      setError(e instanceof Error ? e.message : "Could not connect wallet.");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setWalletStatus("idle");
    setStep("connect");
    setError(null);
  };

  const handleHeaderWalletAction = () => {
    if (walletStatus === "connected") {
      disconnectWallet();
      return;
    }

    void connectWallet();
  };

  const mintPassport = async () => {
    if (passportMinted) {
      setStep("attendance");
      return;
    }
    if (!contractStatus.configured) {
      const id = communityId || "DEV-0001";
      setCommunityId(id);
      setPassportTokenId(1);
      setPassportMinted(true);
      if (walletAddress) writeDemoPassport(walletAddress, id, 1);
      setStep("attendance");
      return;
    }
    if (!memberEmail.includes("@")) {
      setError("Enter the email you used to register with BetterDev.");
      return;
    }
    setError(null);
    setMintSubmitting(true);
    try {
      const res = await fetch("/api/passport/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: memberEmail, walletAddress }),
      });
      const data = (await res.json()) as {
        error?: string;
        ok?: boolean;
        communityId?: string;
        tokenId?: number;
        mintTx?: string;
        alreadyMinted?: boolean;
      };
      if (!res.ok) throw new Error(data.error ?? "Mint failed.");
      setCommunityId(data.communityId ?? "");
      setPassportTokenId(data.tokenId ?? null);
      if (data.mintTx) setMintTxHash(data.mintTx);
      setPassportMinted(true);
      setStep("attendance");
      await refreshOnChainStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mint passport.");
    } finally {
      setMintSubmitting(false);
    }
  };

  return (
    <div className="bg-black text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 px-5 py-4 backdrop-blur sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="text-sm font-black uppercase tracking-tight text-white">betterdev</span>
            <span className="text-xs font-medium uppercase tracking-tight text-brand-sky">Passport</span>
          </Link>
          <nav className="hidden items-center gap-8 text-xs font-medium text-zinc-500 sm:flex">
            <button
              type="button"
              onClick={handleHeaderWalletAction}
              disabled={walletStatus === "connecting"}
              className="font-bold text-white transition hover:text-brand-sky disabled:cursor-not-allowed disabled:opacity-60"
            >
              {walletStatus === "connected"
                ? `Disconnect ${shortAddress(walletAddress)}`
                : walletStatus === "connecting"
                  ? "Connecting..."
                  : "Connect Wallet"}
            </button>
            <a href="#documentation" className="transition hover:text-white">
              Documentation
            </a>
            <Link
              href="/join"
              className="rounded-full border border-white/15 px-5 py-2 text-xs font-bold text-white transition hover:bg-white/10"
            >
              Get Community ID
            </Link>
          </nav>
          <button
            type="button"
            onClick={handleHeaderWalletAction}
            disabled={walletStatus === "connecting"}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 sm:hidden"
          >
            {walletStatus === "connected" ? "Disconnect" : walletStatus === "connecting" ? "Connecting" : "Connect"}
          </button>
        </div>
      </header>
      <section className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-28">
        <div>
          <span className="inline-flex rounded-full border border-brand-sky/20 bg-brand-sky/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-brand-sky">
            Infrastructural Protocol v1.0
          </span>
          <h1 className="mt-6 max-w-[760px] text-[clamp(1.5rem,4.5vw,4.2rem)] font-black leading-[0.94] tracking-[-0.075em] text-white">
            Proof of 
            <br/>
             participation for
          </h1>
          <p className="mt-4 max-w-2xl text-2xl font-medium leading-tight tracking-[-0.03em] text-zinc-400 sm:text-3xl lg:text-4xl">
            real-world engineering communities.
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400">
            A chain-agnostic reputation layer that converts social engineering activities into verifiable milestones.
            Arbitrum is the first deployment surface.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-bold text-zinc-300">
              Protocol: Chain-agnostic
            </span>
            <span className="rounded-full border border-brand-sky/20 bg-brand-sky/10 px-4 py-2 text-xs font-bold text-brand-sky">
              Current deployment: {CURRENT_DEPLOYMENT.deployment}
            </span>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <StepCard
              active={step === "connect"}
              index="01. Connect"
              title="Identity Layer"
              description="Connect your wallet to view or mint your BetterDev Passport."
            />
            <StepCard
              active={step === "passport"}
              index="02. Passport"
              title="Mint Credential"
              description="Mint once — your Passport stays linked to this wallet permanently."
            />
            <StepCard
              active={step === "attendance"}
              index="03. Attendance"
              title="Attend Meetup"
              description="See your Builder Circle assignment and verify participation at the event."
            />
          </div>

          {error && (
            <p className="mt-6 rounded-2xl border border-brand-pink/30 bg-brand-pink/10 p-4 text-sm text-brand-pink">
              {error}
            </p>
          )}

          <div className="relative mt-14 min-h-[180px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-7 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] sm:p-8">
            <AbstractCube />
            {step === "connect" && (
              <>
                <h2 className="text-2xl font-black tracking-tight">View or Mint Passport</h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
                  <span className="font-semibold text-zinc-400">First time here?</span> Connect your wallet and
                  mint your BetterDev Passport once — it stays linked to your wallet permanently.
                </p>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
                  <span className="font-semibold text-zinc-400">Already minted?</span> Connect the same wallet to
                  view your Passport, reputation, and meetup status.
                </p>
                <button
                  type="button"
                  onClick={connectWallet}
                  disabled={walletStatus === "connecting"}
                  className="mt-6 rounded-xl bg-brand-sash-diag px-7 py-3 text-sm font-black text-white shadow-[0_0_36px_-14px_rgba(233,30,140,0.95)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {walletStatus === "connecting" ? "Connecting Wallet" : "Connect Wallet"}
                </button>
              </>
            )}

            {step === "passport" && passportMinted && (
              <>
                <h2 className="text-2xl font-black tracking-tight">Passport already minted</h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
                  Your on-chain BetterDev Passport is linked to{" "}
                  <span className="font-mono text-brand-sky">{communityId || "your Community ID"}</span>.
                  Minting is a one-time event — reconnecting this wallet will always surface your passport.
                </p>
                <div className="mt-6 max-w-sm">
                  <PassportIdCard
                    communityId={communityId}
                    fullName={memberFullName}
                    city={memberCity}
                    joinedLabel={passportJoinedLabel}
                    reputation={passportReputation}
                  />
                  {passportTokenId != null ? (
                    <p className="mt-3 text-center text-xs text-brand-sky">Token ID: {passportTokenId}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setStep("attendance")}
                  className="mt-6 rounded-xl bg-brand-sash-diag px-7 py-3 text-sm font-black text-white shadow-[0_0_36px_-14px_rgba(233,30,140,0.95)] transition hover:opacity-95"
                >
                  Continue to attendance →
                </button>
                {mintTxHash ? (
                  <a
                    href={transactionExplorerUrl(mintTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex text-xs font-bold text-brand-sky hover:text-white"
                  >
                    View mint transaction
                  </a>
                ) : null}
              </>
            )}

            {step === "passport" && !passportMinted && (
              <>
                <h2 className="text-2xl font-black tracking-tight">Mint BetterDev Passport</h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
                  Wallet connected: <span className="font-mono text-brand-sky">{shortAddress(walletAddress)}</span>.
                  Mint your on-chain Passport NFT once — it stays linked to this wallet permanently.
                </p>
                <div className="mt-6 max-w-sm space-y-3">
                  <div>
                    <label htmlFor="passport-email" className="text-xs font-bold text-zinc-400">
                      Registration email
                    </label>
                    <input
                      id="passport-email"
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-brand-sky/40"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="mt-6 max-w-sm">
                  <PassportIdCard
                    communityId={communityId}
                    fullName={memberFullName}
                    city={memberCity}
                    joinedLabel={passportJoinedLabel}
                    reputation={passportReputation}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void mintPassport()}
                  disabled={mintSubmitting || passportMinted}
                  className="mt-6 rounded-xl bg-brand-sash-diag px-7 py-3 text-sm font-black text-white shadow-[0_0_36px_-14px_rgba(233,30,140,0.95)] transition hover:opacity-95 disabled:opacity-60"
                >
                  {mintSubmitting ? "Minting…" : "Mint Passport"}
                </button>
                {mintTxHash && (
                  <a
                    href={transactionExplorerUrl(mintTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex text-xs font-bold text-brand-sky hover:text-white"
                  >
                    View mint transaction
                  </a>
                )}
              </>
            )}

            {step === "attendance" && (
              <MeetupHubCard
                loading={meetupHubLoading}
                meetupId={DEMO_MEETUP.id}
                eventName={meetupEventName ?? DEMO_MEETUP.name}
                eventCity={meetupEventCity ?? DEMO_MEETUP.city}
                eventCountry={meetupEventCountry}
                circlesAssigned={circlesAssigned}
                myCircle={myCircle}
                communityId={communityId}
                attendanceVerified={attendanceVerified}
                onChainReputation={onChainReputation}
                statusLoading={statusLoading}
                canRefreshStatus={memberEmail.includes("@")}
                onRefreshStatus={() => void refreshOnChainStatus()}
              />
            )}
          </div>
        </div>

        <aside className="space-y-8 lg:pt-8">
          {walletStatus === "connected" ? (
            <div>
              <PassportIdCard
                communityId={communityId}
                fullName={memberFullName}
                city={memberCity}
                joinedLabel={passportJoinedLabel}
                reputation={passportReputation}
              />
              {passportMinted && passportTokenId != null ? (
                <p className="mt-3 text-center text-xs text-zinc-500">
                  On-chain Passport · Token ID {passportTokenId}
                </p>
              ) : null}
              {passportMinted && mintTxHash ? (
                <a
                  href={transactionExplorerUrl(mintTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex justify-center text-xs font-bold text-brand-sky transition hover:text-white"
                >
                  View mint on explorer →
                </a>
              ) : null}
            </div>
          ) : (
            <ReputationPipelineCard
              previewReputation={totalPreviewRep}
              walletConnected={false}
              walletAddress={walletAddress}
              onMint={() => setStep("passport")}
            />
          )}

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight">Supported reputation events</h2>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zinc-500">i</span>
            </div>
            <div className="mt-5 space-y-3">
              {REPUTATION_ACTIONS.slice(0, 6).map((action) => (
                <div
                  key={action.type}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black p-4"
                >
                  <div>
                    <p className="text-sm font-bold">{action.label}</p>
                    <p className="mt-1 text-[10px] text-zinc-600">{action.description}</p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-brand-sky">+{action.points}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <MilestoneBadgeGrid
        context={milestoneBadgeContext}
        showMintActions
        onMintSuccess={handleMilestoneMintSuccess}
      />

      <section id="infrastructure" className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 sm:p-12">
          <AbstractCube />
          <Kicker>Meetup coordination</Kicker>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">Builder Circles</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-500">
            City co-leads create a meetup, collect RSVPs, then run fair group assignment. At every event, attendees are
            placed in small circles of 4–6 so they meet engineers they would not normally talk to — no favoritism, no
            manual picking.
          </p>
          <p className="mt-2 text-xs text-zinc-600">Powered by verifiable randomness via Chainlink.</p>

          <BuilderCirclesOrganizerCard />
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-20 text-center sm:px-8 lg:px-10 lg:py-28">
        <Kicker tone="pink">Protocol Architecture</Kicker>
        <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.055em]">
          {PROTOCOL_PRINCIPLE.replaceAll("->", "→")}
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-zinc-500">
          BetterDev is designed as a chain-agnostic protocol, not an NFT-only community. The canonical identity is the
          BetterDev member ID; wallets and chains are attached to it as deployment surfaces.
        </p>
        <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {PROTOCOL_LAYERS.map((layer) => (
            <div key={layer.id} className="min-h-64 rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-left">
              <span
                className={`rounded px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${
                  layer.status === "future" ? "bg-zinc-800 text-zinc-500" : "bg-brand-sky/10 text-brand-sky"
                }`}
              >
                {layer.status}
              </span>
              <h3 className="mt-5 text-lg font-black">{layer.name}</h3>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600">{layer.purpose}</p>
              <div className="mt-6 border-t border-white/10 pt-4 text-zinc-700">→</div>
            </div>
          ))}
        </div>
      </section>

      <section id="documentation" className="mx-auto max-w-[900px] px-5 py-24 sm:px-8 lg:px-10">
        <Kicker>Knowledge Base</Kicker>
        <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">Understanding Passport, NFTs, and rewards</h2>
        <p className="mt-4 text-sm leading-relaxed text-zinc-500">
          BetterDev uses blockchain only where it helps: identity, proof of participation, reputation, and future reward
          distribution.
        </p>

        <div className="mt-12 divide-y divide-white/10">
          {faqItems.map((item) => (
            <details key={item.question} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold text-zinc-100">
                {item.question}
                <span className="text-zinc-700 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-500">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

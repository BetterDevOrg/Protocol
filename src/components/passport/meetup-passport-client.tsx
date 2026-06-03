"use client";

import { createBuilderCircles } from "@/lib/builder-circles";
import { getBetterDevContractStatus } from "@/lib/contracts";
import {
  CHAINLINK_VRF,
  CURRENT_DEPLOYMENT,
  DEMO_ATTENDEES,
  DEMO_MEETUP,
  MILESTONE_BADGES,
  PASSPORT_NETWORK,
  REPUTATION_ACTIONS,
  UNIVERSAL_IDENTITY,
  type BuilderCircle,
} from "@/lib/passport";
import { CHAIN_AGNOSTIC_STRATEGY, PROTOCOL_LAYERS, PROTOCOL_PRINCIPLE } from "@/lib/protocol";
import Link from "next/link";
import { useMemo, useState } from "react";

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
    question: "How does Chainlink VRF help BetterDev?",
    answer:
      "Chainlink VRF powers verifiable random matching for Builder Circles. Organizers request randomness on-chain, and BetterDev uses the verified seed to assign meetup attendees into fair groups that cannot be manually manipulated.",
  },
];

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

export function MeetupPassportClient() {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>("idle");
  const [walletAddress, setWalletAddress] = useState("");
  const [step, setStep] = useState<PassportStep>("connect");
  const [passportMinted, setPassportMinted] = useState(false);
  const [attendanceVerified, setAttendanceVerified] = useState(false);
  const [vrfSeed, setVrfSeed] = useState<number | null>(null);
  const [builderCircles, setBuilderCircles] = useState<BuilderCircle[]>([]);
  const [error, setError] = useState<string | null>(null);

  const totalPreviewRep = useMemo(
    () =>
      REPUTATION_ACTIONS.filter((action) =>
        ["PROFILE_COMPLETED", "MEETUP_ATTENDED", "RECAP_PUBLISHED", "FRIEND_REFERRED"].includes(action.type),
      ).reduce((sum, action) => sum + action.points, 0),
    [],
  );
  const contractStatus = getBetterDevContractStatus();

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
      setStep("passport");
    } catch (e) {
      setWalletStatus("idle");
      setError(e instanceof Error ? e.message : "Could not connect wallet.");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setWalletStatus("idle");
    setStep("connect");
    setPassportMinted(false);
    setAttendanceVerified(false);
    setError(null);
  };

  const handleHeaderWalletAction = () => {
    if (walletStatus === "connected") {
      disconnectWallet();
      return;
    }

    void connectWallet();
  };

  const mintPassport = () => {
    setPassportMinted(true);
    setStep("attendance");
  };

  const verifyAttendance = () => {
    setAttendanceVerified(true);
  };

  const generateBuilderCircles = () => {
    const simulatedSeed = Math.floor(Date.now() % 1_000_000_000);
    setVrfSeed(simulatedSeed);
    setBuilderCircles(createBuilderCircles(DEMO_ATTENDEES, simulatedSeed, DEMO_MEETUP.groupSize));
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
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-bold text-zinc-400">
              Supported: {CHAIN_AGNOSTIC_STRATEGY.supportedChains.join(", ")}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-bold text-zinc-400">
              Mode: {contractStatus.configured ? "Contracts ready" : "Demo fallback"}
            </span>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <StepCard
              active={step === "connect"}
              index="01. Connect"
              title="Identity Layer"
              description="Authenticate via wallet or SSO to initiate your developer profile."
            />
            <StepCard
              active={step === "passport"}
              index="02. Passport"
              title="Mint Credential"
              description="Generate a non-transferable ID for ecosystem recognition."
            />
            <StepCard
              active={step === "attendance"}
              index="03. Attendance"
              title="Verify Action"
              description="Scan QR codes at verified meetups to accumulate reputation."
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
                <h2 className="text-2xl font-black tracking-tight">Attend our next meetup</h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
                  Your first blockchain step is not a token sale. It is a verified meetup action tied to your
                  BetterDev Passport.
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

            {step === "passport" && (
              <>
                <h2 className="text-2xl font-black tracking-tight">Mint BetterDev Passport</h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
                  Wallet connected: <span className="font-mono text-brand-sky">{shortAddress(walletAddress)}</span>.
                  First-time attendees mint a BetterDev Passport tied to their universal Community ID.
                </p>
                <div className="mt-6 max-w-sm rounded-2xl border border-brand-sky/20 bg-brand-sky/10 p-4">
                  <Kicker>Credential Preview</Kicker>
                  <p className="mt-3 font-mono text-3xl font-black">BD-000001</p>
                  <p className="mt-1 text-sm text-zinc-400">{UNIVERSAL_IDENTITY.productName}</p>
                  <p className="mt-1 text-xs text-zinc-500">Current deployment: {PASSPORT_NETWORK.name}</p>
                </div>
                <button
                  type="button"
                  onClick={mintPassport}
                  className="mt-6 rounded-xl bg-brand-sash-diag px-7 py-3 text-sm font-black text-white shadow-[0_0_36px_-14px_rgba(233,30,140,0.95)] transition hover:opacity-95"
                >
                  {passportMinted ? "Passport Minted" : "Mint Passport"}
                </button>
              </>
            )}

            {step === "attendance" && (
              <>
                <h2 className="text-2xl font-black tracking-tight">Verify meetup attendance</h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
                  At the meetup, an organizer generates a QR code. Members scan it to create a verified attendance
                  event that updates their BetterDev ID, not only the connected wallet.
                </p>
                <button
                  type="button"
                  onClick={verifyAttendance}
                  className="mt-6 rounded-xl bg-brand-sash-diag px-7 py-3 text-sm font-black text-white shadow-[0_0_36px_-14px_rgba(233,30,140,0.95)] transition hover:opacity-95"
                >
                  {attendanceVerified ? "Attendance Verified" : "Simulate QR Scan"}
                </button>
                {attendanceVerified && (
                  <p className="mt-5 max-w-lg rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                    Attendance event recorded. First Meetup Stamp is now ready for the milestone pipeline.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <aside className="space-y-8 lg:pt-8">
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
                <span className="text-6xl font-black tracking-[-0.08em]">{totalPreviewRep}</span>
                <span className="mb-2 text-sm font-bold uppercase text-zinc-500">Rep</span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">points from profile, attendance, recap, and referral events</p>
            </div>
            <div className="mt-7">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-zinc-400">Pipeline Status</span>
                <span className="font-black uppercase text-brand-sky">Active // 0x...f32</span>
              </div>
              <div className="mt-4 h-1 rounded-full bg-white/10">
                <div className="h-full w-[55%] rounded-full bg-brand-sky shadow-[0_0_20px_rgba(56,189,248,0.55)]" />
              </div>
            </div>
          </div>

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

      <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mb-10 flex items-end justify-between gap-6 border-b border-white/10 pb-7">
          <div>
            <Kicker tone="muted">System Achievements</Kicker>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Milestone badges</h2>
          </div>
          <p className="hidden text-xs text-zinc-600 sm:block">Showing 4 of 4 unlocked statuses</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MILESTONE_BADGES.map((badge) => (
            <div key={badge.id} className="min-h-48 rounded-2xl border border-white/10 bg-white/[0.035] p-7">
              <h3 className="mt-10 text-base font-black">{badge.name}</h3>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600">{badge.description}</p>
              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.24em] text-brand-pink">
                {badge.threshold === 0 ? "Identity" : `${badge.threshold}+ Rep`}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="infrastructure" className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 sm:p-12">
          <AbstractCube />
          <Kicker>Coordination Layer</Kicker>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">Chainlink VRF Builder Circles</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-500">
            BetterDev uses {CHAINLINK_VRF.name} to generate verifiable randomness for meetup matching. Organizers
            request randomness on the current deployment network, then the verified seed shuffles attendees into fair
            Builder Circles while reputation stays attached to the BetterDev member ID.
          </p>

          <div className="mt-10 max-w-xl rounded-2xl border border-white/10 bg-black p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-600">Session ID</p>
                <p className="mt-2 font-bold">{DEMO_MEETUP.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-600">Status</p>
                <p className="mt-1 text-[10px] font-black uppercase text-emerald-400">Ready for shuffle</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Attendees</p>
                <p className="mt-2 font-black">{DEMO_ATTENDEES.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Groups of</p>
                <p className="mt-2 font-black">{DEMO_MEETUP.groupSize}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Deployment</p>
                <p className="mt-2 font-black text-brand-sky">{PASSPORT_NETWORK.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={generateBuilderCircles}
              className="w-full rounded-xl bg-brand-sash-diag px-5 py-3 text-sm font-black text-white shadow-[0_0_36px_-14px_rgba(233,30,140,0.95)] transition hover:opacity-95"
            >
              Generate Builder Circles
            </button>
            {vrfSeed !== null && <p className="mt-4 break-all font-mono text-xs text-brand-sky">VRF seed: {vrfSeed}</p>}
          </div>

          {builderCircles.length > 0 && (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {builderCircles.map((circle) => (
                <div key={circle.id} className="rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-sm font-black text-white">{circle.id}</p>
                  <div className="mt-4 space-y-2">
                    {circle.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-zinc-300">{member.name}</span>
                        <span className="text-right text-zinc-600">{member.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
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

export type ReputationCategory = "community" | "social" | "profile" | "knowledge" | "open-source";

export type ReputationAction = {
  type: string;
  label: string;
  points: number;
  category: ReputationCategory;
  nftPolicy: "event-only" | "milestone";
  description: string;
};

export type MilestoneBadge = {
  id: string;
  name: string;
  threshold: number;
  description: string;
};

export type BuilderCircleMember = {
  id: string;
  name: string;
  role: string;
  city: string;
};

export type BuilderCircle = {
  id: string;
  members: BuilderCircleMember[];
};

export type SupportedChain = {
  id: "arbitrum" | "solana" | "base" | "ethereum";
  name: string;
  status: "current" | "supported" | "future";
  deployment?: string;
};

export type WalletRegistryEntry = {
  memberId: string;
  wallets: {
    chain: SupportedChain["name"];
    address: string;
  }[];
};

export const UNIVERSAL_IDENTITY = {
  productName: "BetterDev Passport",
  canonicalIdPrefix: "BD",
  principle: "Reputation belongs to the BetterDev member ID, not to a single wallet address.",
} as const;

export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    id: "arbitrum",
    name: "Arbitrum",
    status: "current",
    deployment: "Arbitrum Sepolia",
  },
  {
    id: "solana",
    name: "Solana",
    status: "supported",
  },
  {
    id: "base",
    name: "Base",
    status: "future",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    status: "future",
  },
];

export const CURRENT_DEPLOYMENT = SUPPORTED_CHAINS[0];

export const WALLET_REGISTRY_EXAMPLE: WalletRegistryEntry = {
  memberId: "BD-000001",
  wallets: [
    { chain: "Arbitrum", address: "0x123..." },
    { chain: "Solana", address: "7Yk..." },
  ],
};

export const PASSPORT_NETWORK = {
  name: "Arbitrum Sepolia",
  chainId: 421614,
  chainIdHex: "0x66eee",
} as const;

export const CHAINLINK_VRF = {
  name: "Chainlink VRF",
  purpose: "Verifiable random builder-circle matching for meetup attendees",
  coordinator: "Arbitrum Sepolia VRF Coordinator",
  confirmationTarget: 3,
  groupSize: 4,
} as const;

export const DEMO_MEETUP = {
  id: process.env.NEXT_PUBLIC_EVENT_MEETUP_ID || "betterdev-lagos-001",
  name: "BetterDev Lagos Builder Meetup #1",
  city: "Lagos",
  groupSize: CHAINLINK_VRF.groupSize,
} as const;

export const DEMO_ATTENDEES: BuilderCircleMember[] = [
  { id: "bd-0001", name: "Ada", role: "Frontend Engineer", city: "Lagos" },
  { id: "bd-0002", name: "Tunde", role: "Protocol Engineer", city: "Lagos" },
  { id: "bd-0003", name: "Maya", role: "Product Builder", city: "Lagos" },
  { id: "bd-0004", name: "Chidi", role: "Open Source Contributor", city: "Lagos" },
  { id: "bd-0005", name: "Grace", role: "Student Builder", city: "Lagos" },
  { id: "bd-0006", name: "Ibrahim", role: "Backend Engineer", city: "Lagos" },
  { id: "bd-0007", name: "Nora", role: "Community Organizer", city: "Lagos" },
  { id: "bd-0008", name: "David", role: "Security Researcher", city: "Lagos" },
  { id: "bd-0009", name: "Zainab", role: "Mobile Engineer", city: "Lagos" },
  { id: "bd-0010", name: "Kelechi", role: "Mentor", city: "Lagos" },
  { id: "bd-0011", name: "Femi", role: "Startup Founder", city: "Lagos" },
  { id: "bd-0012", name: "Joy", role: "Technical Writer", city: "Lagos" },
];

export const REPUTATION_ACTIONS: ReputationAction[] = [
  {
    type: "MEETUP_ATTENDED",
    label: "Attend meetup",
    points: 20,
    category: "community",
    nftPolicy: "event-only",
    description: "Verified by organizer QR code at a BetterDev meetup.",
  },
  {
    type: "MEETUP_ORGANIZED",
    label: "Organize meetup",
    points: 50,
    category: "community",
    nftPolicy: "milestone",
    description: "Host or co-lead a verified BetterDev local meetup.",
  },
  {
    type: "RECAP_PUBLISHED",
    label: "Publish recap",
    points: 10,
    category: "social",
    nftPolicy: "event-only",
    description: "Optional bonus for writing a recap thread or post.",
  },
  {
    type: "PHOTO_SHARED",
    label: "Share photos",
    points: 5,
    category: "social",
    nftPolicy: "event-only",
    description: "Optional bonus for sharing meetup photos and tagging BetterDev.",
  },
  {
    type: "FRIEND_REFERRED",
    label: "Bring a friend",
    points: 15,
    category: "social",
    nftPolicy: "event-only",
    description: "Optional bonus when a referred engineer joins and attends.",
  },
  {
    type: "PROFILE_COMPLETED",
    label: "Complete profile",
    points: 10,
    category: "profile",
    nftPolicy: "event-only",
    description: "Complete profile details needed for BetterDev opportunities.",
  },
  {
    type: "ARTICLE_PUBLISHED",
    label: "Publish article",
    points: 20,
    category: "knowledge",
    nftPolicy: "milestone",
    description: "Publish a useful engineering article, tutorial, or research note.",
  },
  {
    type: "CODE_CONTRIBUTION",
    label: "Contribute code",
    points: 40,
    category: "open-source",
    nftPolicy: "milestone",
    description: "Make a verified code contribution to a BetterDev or partner project.",
  },
];

export const MILESTONE_BADGES: MilestoneBadge[] = [
  {
    id: "betterdev-passport",
    name: "BetterDev Passport",
    threshold: 0,
    description: "Minted once as the member's on-chain BetterDev identity.",
  },
  {
    id: "first-meetup",
    name: "First Meetup Stamp",
    threshold: 20,
    description: "Unlocked after the first verified meetup attendance.",
  },
  {
    id: "community-builder",
    name: "Community Builder",
    threshold: 100,
    description: "Unlocked after consistent participation and contribution.",
  },
  {
    id: "community-champion",
    name: "Community Champion",
    threshold: 250,
    description: "Unlocked for members who help grow BetterDev across chapters.",
  },
];

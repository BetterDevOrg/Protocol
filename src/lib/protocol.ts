export type ProtocolLayerId = "identity" | "reputation" | "coordination" | "intelligence" | "opportunity";

export type StorageBoundary = "on-chain" | "off-chain" | "hybrid";

export type ProtocolLayer = {
  id: ProtocolLayerId;
  name: string;
  status: "mvp" | "next" | "future";
  purpose: string;
  onChain: string[];
  offChain: string[];
};

export type ProtocolContract = {
  name: string;
  layer: ProtocolLayerId;
  priority: "mvp" | "future";
  responsibility: string;
  coreMethods: string[];
};

export type ReputationEventType =
  | "ATTEND_MEETUP"
  | "PUBLISH_ARTICLE"
  | "COMPLETE_PROFILE"
  | "REFER_MEMBER"
  | "ORGANIZE_EVENT"
  | "OPEN_SOURCE_CONTRIBUTION"
  | "MENTORSHIP_COMPLETED"
  | "HACKATHON_WINNER";

export type ReputationEventSchema = {
  memberId: "string";
  wallet?: "address";
  chain?: "string";
  eventType: ReputationEventType;
  points: number;
  issuer: "address";
  proofURI?: string;
  timestamp: number;
};

export const PROTOCOL_PRINCIPLE = "Identity -> Reputation -> Coordination -> Opportunity" as const;

export const CHAIN_AGNOSTIC_STRATEGY = {
  principle: "BetterDev Passport is the identity. Chains are deployment surfaces.",
  currentDeployment: "Arbitrum",
  supportedChains: ["Arbitrum", "Solana"],
  futureChains: ["Base", "Ethereum"],
  canonicalIdentity: "BD-000001",
} as const;

export const PROTOCOL_LAYERS: ProtocolLayer[] = [
  {
    id: "identity",
    name: "Identity",
    status: "mvp",
    purpose: "Create a universal BetterDev identity through Community ID, Passport, wallet registry, and profile data.",
    onChain: ["Passport NFT", "memberId", "linked wallet", "joinedAt", "metadataURI"],
    offChain: ["wallet registry", "name", "email", "phone", "country", "city", "bio", "skills", "interests", "social links", "avatar"],
  },
  {
    id: "reputation",
    name: "Reputation",
    status: "mvp",
    purpose: "Record participation and contribution against the canonical member ID, not against fragmented wallet addresses.",
    onChain: ["memberId", "eventType", "points", "issuer", "timestamp", "proofURI/hash"],
    offChain: ["source wallet", "source chain", "rich proof content", "article URLs", "recap links", "photos", "GitHub PRs", "admin review notes"],
  },
  {
    id: "coordination",
    name: "Coordination",
    status: "mvp",
    purpose: "Coordinate real-world meetups, attendance verification, and Chainlink VRF-powered Builder Circles.",
    onChain: ["meetupId", "attendance verification", "VRF requestId", "VRF seed", "circle assignment hash"],
    offChain: ["venue", "agenda", "attendee list", "QR sessions", "circle display", "feedback", "endorsements"],
  },
  {
    id: "intelligence",
    name: "Intelligence",
    status: "future",
    purpose: "Improve matching through profile context, goals, skills, reputation, and AI-assisted recommendations.",
    onChain: ["matching round proof hash", "final assignment commitment", "participation result"],
    offChain: ["skills graph", "interests", "goals", "experience level", "AI matching logic", "privacy-sensitive context"],
  },
  {
    id: "opportunity",
    name: "Opportunity",
    status: "future",
    purpose: "Use reputation and verified participation to unlock grants, jobs, bounties, mentorship, and partner programs.",
    onChain: ["eligibility proof", "claim record", "achievement badge", "reward distribution event"],
    offChain: ["job posts", "grant applications", "partner CRM", "selection notes", "private applications"],
  },
];

export const MVP_CONTRACTS: ProtocolContract[] = [
  {
    name: "BetterDevPassport",
    layer: "identity",
    priority: "mvp",
    responsibility: "Chain-specific identity credential that points back to the universal BetterDev member ID.",
    coreMethods: ["mintPassport(address user, string memberId, string metadataURI)", "passportOf(address user)"],
  },
  {
    name: "ReputationRegistry",
    layer: "reputation",
    priority: "mvp",
    responsibility: "Append-only ledger for contribution and participation events tied to a canonical member ID.",
    coreMethods: [
      "recordEvent(string memberId, uint256 eventType, uint256 points, string proofURI)",
      "reputationOf(string memberId)",
    ],
  },
  {
    name: "MeetupRegistry",
    layer: "coordination",
    priority: "mvp",
    responsibility: "Meetup creation, QR attendance verification, and Chainlink VRF seed storage for Builder Circles.",
    coreMethods: [
      "createMeetup(bytes32 meetupId)",
      "verifyAttendance(bytes32 meetupId, address attendee)",
      "requestBuilderCircleRandomness(bytes32 meetupId)",
      "getMeetupSeed(bytes32 meetupId)",
    ],
  },
];

export const STORAGE_RULES = [
  "Private, editable, large, or sensitive data stays off-chain.",
  "Public proof, reputation events, attendance verification, and coordination primitives can be recorded on-chain.",
  "Canonical identity and reputation belong to the BetterDev member ID, not a single chain wallet.",
  "NFTs represent identity and major milestones, not every small action.",
  "New contribution types should be added as reputation event types, not new contracts.",
] as const;

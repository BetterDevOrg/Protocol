# BetterDev Protocol Architecture v1

BetterDev Protocol is a chain-agnostic reputation and coordination system for real-world engineering communities.

The protocol is designed around this principle:

```text
Identity -> Reputation -> Coordination -> Opportunity
```

BetterDev is not an NFT-first product and not an Arbitrum-only identity product. NFTs are identity and milestone containers. The real asset is the reputation graph created around engineers and their real-world contributions.

The protocol position is:

```text
BetterDev Passport is the identity.
Chains are deployment surfaces.
Reputation belongs to the BetterDev member ID.
```

Current deployment:

```text
Arbitrum
```

Supported chains from the protocol architecture:

```text
Arbitrum
Solana
```

## Design Goals

- Keep private and editable data off-chain.
- Put public proof and coordination primitives on-chain.
- Make the reputation system expandable without redeploying new contracts for every action type.
- Use NFTs only for identity and meaningful milestones.
- Use Chainlink VRF for fair, verifiable Builder Circle matching.
- Prevent identity and reputation fragmentation between chains.
- Keep future AI matching modular and off-chain.

## Layer 1: Identity

Identity establishes who the member is inside the BetterDev network.

Every member receives a canonical BetterDev ID:

```text
BD-000001
BD-000002
BD-000003
```

This ID is the source of truth. Wallet addresses are attached to it through a wallet registry.

Example:

```json
{
  "memberId": "BD-000001",
  "wallets": [
    {
      "chain": "Arbitrum",
      "address": "0x123..."
    },
    {
      "chain": "Solana",
      "address": "7Yk..."
    }
  ]
}
```

### On-chain

- BetterDev Passport NFT
- linked wallet address
- community ID
- joined timestamp
- metadata URI

### Off-chain

- name
- email
- phone
- country
- city
- bio
- skills
- interests
- X / LinkedIn / GitHub links
- profile image
- wallet registry

### Contract

```text
BetterDevPassport
```

Core responsibility:

```solidity
mintPassport(address user, string memberId, string metadataURI)
```

The Passport is the member's identity container on a deployment chain. It points back to the universal BetterDev member ID and should not store sensitive profile fields.

## Layer 2: Reputation

Reputation records participation, contribution, and trust signals.

This is the most important protocol layer.

Reputation belongs to:

```text
BD-000001
```

Not:

```text
0x123...
```

This prevents reputation fragmentation when the same member uses Arbitrum for meetup attendance and Solana for another future contribution flow.

### On-chain

- member ID
- event type
- points
- issuer/verifier
- timestamp
- optional proof URI/hash

### Off-chain

- article URLs
- recap links
- photo evidence
- GitHub pull requests
- human review notes
- long-form proof descriptions
- source wallet and source chain metadata

### Contract

```text
ReputationRegistry
```

Core responsibility:

```solidity
recordEvent(
  string memberId,
  uint256 eventType,
  uint256 points,
  string proofURI
)
```

Every future action should become a reputation event:

```text
ATTEND_MEETUP
PUBLISH_ARTICLE
COMPLETE_PROFILE
REFER_MEMBER
ORGANIZE_EVENT
OPEN_SOURCE_CONTRIBUTION
MENTORSHIP_COMPLETED
HACKATHON_WINNER
```

This lets BetterDev add new contribution types without changing the core contract architecture.

## Layer 3: Coordination

Coordination turns meetups into structured, meaningful engineering relationships.

### On-chain

- meetup ID
- attendance verification
- Chainlink VRF request ID
- Chainlink VRF seed
- optional Builder Circle assignment hash

### Off-chain

- meetup title
- venue
- agenda
- attendee list
- QR sessions
- group display
- feedback
- relationship endorsements

### Contract

```text
MeetupRegistry
```

Core responsibilities:

```solidity
createMeetup(bytes32 meetupId)
verifyAttendance(bytes32 meetupId, address attendee)
requestBuilderCircleRandomness(bytes32 meetupId)
getMeetupSeed(bytes32 meetupId)
```

### Chainlink VRF Builder Circles

BetterDev uses Chainlink VRF to create fair, verifiable meetup matching. For the buildathon, the first deployment uses Arbitrum. The protocol itself remains chain-agnostic because the resulting attendance and reputation events resolve back to the BetterDev member ID.

Flow:

```text
Attendees register
-> Organizer requests randomness
-> Chainlink VRF returns verified seed
-> App deterministically shuffles attendees
-> Builder Circles are created
```

The attendee list and group display can remain off-chain for cost and privacy. The random seed is on-chain and verifiable.

## Future Layer 4: Intelligence

The intelligence layer improves matching quality.

Today:

```text
Chainlink VRF random matching
```

Future:

```text
reputation-aware matching
context-aware matching
AI-assisted matching
```

Inputs can include:

- skills
- goals
- interests
- experience level
- reputation
- location
- previous participation

Important rule:

```text
Do not put AI logic in smart contracts.
```

The contract only needs to store proofs, commitments, or final participation events.

## Future Layer 5: Opportunity

The opportunity layer converts reputation into useful access.

Examples:

- grants
- jobs
- bounties
- mentorship
- hackathons
- research programs
- speaking slots
- partner opportunities
- city and campus leadership roles

Example rule:

```text
If reputation >= 250 and member has Organizer Badge, member can apply for City Co-Lead opportunities.
```

This should be built after the core reputation and coordination primitives are stable.

## On-chain vs Off-chain Rules

### Put on-chain

- Passport NFT
- wallet
- community ID
- reputation events
- points
- proof URI/hash
- attendance verification
- VRF seed
- milestone badges

### Keep off-chain

- email
- phone
- full name
- bio
- profile image
- private application data
- admin notes
- long descriptions
- uploaded files
- venue logistics

Rule of thumb:

```text
If it is private, large, editable, or sensitive, keep it off-chain.
If it is public proof, reputation, attendance, or coordination data, it may be on-chain.
```

## MVP Contract Set

For the Arbitrum buildathon, BetterDev should focus on three Arbitrum-first contracts while preserving the chain-agnostic member identity model:

### BetterDevPassport

ERC-721 identity credential.

Purpose:

```text
This wallet owns a BetterDev Passport tied to a BetterDev member ID.
```

### ReputationRegistry

Append-only reputation event ledger.

Purpose:

```text
This BetterDev member ID performed a valuable action.
```

### MeetupRegistry

Meetup attendance and Builder Circle coordination.

Purpose:

```text
This member attended this event and this meetup used verifiable randomness for group matching.
```

## Expandability

The protocol should grow by adding:

- new reputation event types
- new milestone badges
- new opportunity eligibility rules
- new off-chain matching strategies
- new verifier roles
- new supported chains and wallet registry adapters

It should not require new NFT contracts for every new action.

Example:

```text
Hackathon Winner
-> eventType = HACKATHON_WINNER
-> points = 100
-> optional proofURI
-> optional milestone badge
```

No protocol redesign required.

## Summary

BetterDev Protocol is not:

```text
NFT -> NFT -> NFT
```

It is:

```text
Identity -> Reputation -> Coordination -> Opportunity
```

That structure keeps the project scalable, understandable, and expandable across cities, campuses, ecosystems, and future partner opportunities.

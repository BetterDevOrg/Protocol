# BetterDev

BetterDev is a chain-agnostic reputation and coordination protocol for real-world engineering communities.

The project helps engineers move from passive online networking into verified real-world participation. Members join local chapters, receive a BetterDev Community ID, attach one or more wallets, build reputation through useful actions, and use the BetterDev Passport layer to prove participation across meetups, builder circles, and future ecosystem opportunities.

BetterDev is **Arbitrum-first**, not Arbitrum-only:

```text
Protocol: BetterDev Passport
Canonical identity: BD-000001
Current deployment: Arbitrum
Supported chains: Arbitrum, Solana
Future chains: Base, Ethereum
```

## Buildathon Positioning

BetterDev is built around three product layers:

1. **Identity**
   - BetterDev Community ID
   - BetterDev Passport
   - Wallet registry for Arbitrum, Solana, and future supported chains

2. **Reputation**
   - Meetup attendance
   - Profile completion
   - Referrals
   - Articles, tutorials, and research
   - Organizer, mentor, and contributor activity

3. **Coordination**
   - Chainlink VRF-powered Builder Circles
   - Fair meetup group assignment
   - Verifiable community coordination
   - Future context-aware matching using member goals, skills, and interests

The core idea is simple:

> BetterDev is a chain-agnostic reputation and coordination protocol for engineering communities. Members receive a universal BetterDev Passport, build portable reputation through verified contributions, and participate in real-world meetups coordinated on-chain. The protocol is designed to support multiple ecosystems, with Arbitrum serving as the initial deployment network.

The detailed protocol design is documented in [`docs/protocol-architecture.md`](docs/protocol-architecture.md).

## Protocol Architecture

BetterDev Protocol is designed to be expandable beyond the hackathon MVP. The system should grow by adding new reputation events, milestone badges, verifier roles, matching strategies, supported chains, and opportunity rules without redesigning the core identity model.

The protocol avoids chain fragmentation:

```text
Attend meetup with Arbitrum wallet  -> +20 reputation
Publish research with Solana wallet -> +30 reputation
Organize event with another wallet  -> +50 reputation

Total reputation belongs to BD-000001, not to each wallet separately.
```

The protocol boundary is:

```text
On-chain: identity, public proof, reputation events, attendance verification, VRF seeds, milestone badges
Off-chain: private profile data, email, phone, wallet registry, rich proof content, uploaded files, admin notes, venue logistics
```

The MVP contract set is:

```text
BetterDevPassport  -> identity credential
ReputationRegistry -> append-only contribution event ledger
MeetupRegistry     -> attendance verification + Chainlink VRF Builder Circle seed
```

Future layers such as AI-assisted matching and opportunity distribution should remain modular. They can read identity, reputation, and coordination data without being baked directly into smart contracts.

## Current Demo Flow

### Community Onboarding

1. A member joins BetterDev from the landing page.
2. The onboarding form validates country and phone number.
3. Member data is stored in Google Sheets while Supabase remains optional.
4. The member receives a Community ID.

### Passport and Attendance

1. A member clicks the floating **Attend Next Meetup** card.
2. The member opens `/meetup`.
3. The member connects a wallet.
4. The member mints or previews a BetterDev Passport tied to their BetterDev member ID.
5. The member verifies meetup attendance through an organizer QR flow.
6. Attendance becomes a reputation event.
7. Major milestones can unlock NFT badges.

### Chainlink VRF Builder Circles

1. Attendees register for a meetup.
2. An organizer requests randomness from Chainlink VRF on the current Arbitrum deployment.
3. The verified random seed is used to shuffle attendees.
4. Attendees are assigned into Builder Circles.
5. Builder Circles create fair, manipulation-resistant networking groups.

This avoids manual bias in group formation and helps members meet engineers they would not usually meet.

## Why Blockchain

BetterDev does not use blockchain for speculation. It uses blockchain where it is useful:

- **Passport:** universal membership identity with chain-specific deployment credentials
- **Reputation:** verifiable participation and contribution trail tied to the BetterDev member ID
- **Milestone NFTs:** meaningful achievements, not spam badges
- **Chainlink VRF:** fair random matching for real-world meetup groups

Most actions create reputation events. NFTs are reserved for meaningful milestones.

```text
Action -> Reputation Event -> Reputation Score -> Optional Milestone NFT
```

Examples:

- Attend meetup: +20 reputation
- Publish recap: +10 reputation
- Bring a friend: +15 reputation
- Complete profile: +10 reputation
- Publish article: +20 reputation
- Contribute code: +40 reputation

## Chainlink VRF Integration

The repo includes a Chainlink VRF consumer scaffold:

```text
contracts/BuilderCircleVRF.sol
```

The contract is responsible for:

- requesting randomness for a meetup
- receiving the Chainlink VRF random word
- storing the verified random seed
- exposing the seed for deterministic Builder Circle generation

The app then uses that seed to shuffle attendees off-chain. This is cheaper and more scalable than storing large attendee lists on-chain while still preserving verifiable randomness.

Relevant frontend files:

```text
src/lib/passport.ts
src/lib/builder-circles.ts
src/components/passport/meetup-passport-client.tsx
src/app/meetup/page.tsx
```

## Tech Stack

- Next.js 15
- React 19
- Tailwind CSS
- Google Sheets Apps Script for launch registration storage
- Optional Supabase schema for later production database storage
- Chain-agnostic protocol model with Arbitrum-first deployment
- Arbitrum Sepolia for the buildathon blockchain layer
- Solana support in the protocol architecture
- Chainlink VRF for verifiable Builder Circle matching

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Passport demo:

```text
http://localhost:3000/meetup
```

## Environment Variables

Copy `.env.example` to `.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_USE_SUPABASE=false

GOOGLE_SHEETS_WEBAPP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
GOOGLE_SHEETS_API_TOKEN=your-long-random-token
```

### Storage Mode

```env
NEXT_PUBLIC_USE_SUPABASE=false
```

Uses Google Sheets as the current source of truth for member registrations.

```env
NEXT_PUBLIC_USE_SUPABASE=true
```

Uses Supabase through `/api/members/register`.

## Google Sheets Registration Storage

The Apps Script template lives here:

```text
scripts/google-sheets-webapp.js
```

Deploy it as a Google Apps Script Web App:

- Execute as: `Me`
- Access: `Anyone`
- Protect writes with `GOOGLE_SHEETS_API_TOKEN`

Expected `submissions` sheet headers:

```text
created_at
full_name
email
phone_e164
country
city
x_username
x_profile_link
followed_x
joined_community
member_number
community_id
invite_slug
referred_by_invite_slug
source_ip
user_agent
```

## Supabase Schema

Supabase migrations are provided in:

```text
supabase/migrations/001_members.sql
supabase/migrations/002_members_phone.sql
```

Supabase is optional while Google Sheets is used for launch-mode registration.

## Product Pages

- `/` - BetterDev landing page
- `/join` - redirects into onboarding modal
- `/meetup` - BetterDev Passport, reputation, and Builder Circles demo
- `/partnership` - partner onboarding page
- `/careers` - contributor and role interest page
- `/contact` - BetterDev contact page

## Arbitrum Buildathon MVP

The intended buildathon scope is:

- BetterDev landing and onboarding
- Community ID registration
- Wallet connection scaffold
- BetterDev Passport UX
- Attendance verification UX
- Reputation event model
- Milestone NFT model
- Chainlink VRF Builder Circle matching
- Chainlink VRF smart contract scaffold

The next engineering step is wiring the `/meetup` UI to deployed contracts on Arbitrum Sepolia while preserving the chain-agnostic identity model.

## Smart Contract Deployment Notes

The repo now includes a Hardhat-based smart contract suite:

```text
contracts/BetterDevPassport.sol
contracts/ReputationRegistry.sol
contracts/MeetupRegistry.sol
contracts/BuilderCircleVRF.sol
```

Install contract dependencies:

```bash
npm install
```

Compile contracts:

```bash
npm run contracts:compile
```

Run contract tests:

```bash
npm run contracts:test
```

Export ABIs for frontend use:

```bash
npm run contracts:export
```

Typical deployment inputs:

- Arbitrum Sepolia VRF Coordinator
- VRF subscription ID
- Key hash
- Callback gas limit
- Request confirmations

Deployment is prepared but should only be run after `.env.local` contains a safe RPC URL and deployer private key:

```bash
npm run contracts:deploy:sepolia
```

The contract flow:

```text
requestBuilderCircleRandomness(meetupId)
-> Chainlink VRF fulfills request
-> contract stores randomSeed
-> app reads randomSeed
-> app generates Builder Circles
```

## Development Checks

Typecheck:

```bash
npx tsc --noEmit
```

Build:

```bash
npm run build
```

## Project Vision

BetterDev is not just a community landing page. It is a coordination layer for engineering communities.

The long-term system should help members:

- prove real-world participation
- build portable engineering reputation
- unlock grants and partner opportunities
- join fair Builder Circles at meetups
- earn recognition for meaningful contribution
- form higher-quality relationships across cities and campuses

BetterDev optimizes for meaningful engineering relationships, not passive social feeds.

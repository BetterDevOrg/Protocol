# BetterDev

**BetterDev is a chain-agnostic reputation and coordination protocol for real-world engineering communities.**

**Members receive a Community ID, build portable reputation through verified meetup participation, and use the Passport layer to prove contribution across cities and ecosystems.**

**The MVP runs on [Arbitrum Sepolia](https://sepolia.arbiscan.io/) with Google Sheets storage, email OTP login, QR check-in, and on-chain attendance verification — designed to expand to additional chains without fragmenting identity.**

Built with love ❤️ for engineers who prefer real connections over passive feeds.

<p align="center">
  <a href="https://betterdev.live">
    <strong>▶ OPEN BETTERDEV LIVE</strong>
    <br /><br />
    <img
      width="100%"
      alt="BetterDev landing page — Meet Engineers. Build Real Connections."
      src="docs/assets/hero.png"
    />
  </a>
</p>

<p align="center">
  <a href="https://betterdev.live">
    <img src="https://img.shields.io/badge/Live_Project-betterdev.live-7c3aed?style=for-the-badge&logo=vercel&logoColor=white" alt="Live project" />
  </a>
  &nbsp;&nbsp;
  <a href="https://betterdev.live/login">
    <img src="https://img.shields.io/badge/Member_Login-Email_OTP-3b82f6?style=for-the-badge&logo=gmail&logoColor=white" alt="Member login" />
  </a>
  &nbsp;&nbsp;
  <a href="https://betterdev.live/organizer">
    <img src="https://img.shields.io/badge/Organizer-Create_Event-28A0F0?style=for-the-badge&logo=calendar&logoColor=white" alt="Organizer dashboard" />
  </a>
  &nbsp;&nbsp;
  <a href="docs/protocol-architecture.md">
    <img src="https://img.shields.io/badge/Docs-Protocol_Architecture-181717?style=for-the-badge&logo=gitbook&logoColor=white" alt="Protocol documentation" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/network-Arbitrum_Sepolia-28A0F0?style=flat-square" alt="Arbitrum Sepolia" />
  <img src="https://img.shields.io/badge/storage-Google_Sheets-34A853?style=flat-square&logo=googlesheets&logoColor=white" alt="Google Sheets MVP" />
  <img src="https://img.shields.io/badge/VRF-Chainlink-375BD2?style=flat-square&logo=chainlink&logoColor=white" alt="Chainlink VRF" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
</p>

---

## Overview

BetterDev helps engineers move from passive online networking into **verified real-world participation**. Members join local chapters, receive a **Community ID** (`DEV-0001`), log in with email, build reputation through useful actions, and use the **BetterDev Passport** to prove participation across meetups, Builder Circles, and future ecosystem opportunities.

BetterDev is **Arbitrum-first**, not Arbitrum-only:

```text
Protocol:     BetterDev Passport
Identity:     Community ID (DEV-0001)
Deployment:   Arbitrum Sepolia
Future chains: Base, Ethereum, Solana (protocol design)
```

> Identity and reputation belong to the BetterDev member ID — not to individual wallets or chains.

Deep protocol design: [`docs/protocol-architecture.md`](docs/protocol-architecture.md)

---

## Features

| Layer | What ships today |
|-------|------------------|
| **Identity** | Community ID, invite links, member registration |
| **Auth** | Email + 6-digit OTP login → `/login`, `/profile` |
| **Events** | Organizer creates meetups on-chain + Google Sheets |
| **Check-in** | QR scan → member number → +20 reputation on-chain |
| **Passport** | Wallet mint, metadata URI, reputation UI |
| **Builder Circles** | Chainlink VRF seed + fair group assignment (UI scaffold) |

### Product layers

1. **Identity** — Community ID, Passport, wallet registry (multi-chain in protocol design)
2. **Reputation** — Meetup attendance, profile completion, referrals, publications (roadmap)
3. **Coordination** — Chainlink VRF Builder Circles, fair meetup group assignment

---

## Architecture

```text
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Next.js    │────▶│ Google Sheets│     │  Apps Script    │
│  (Vercel)   │     │  (members,   │◀────│  webapp API     │
│             │     │   events,    │     └─────────────────┘
│  /login     │     │   checkins,  │
│  /profile   │     │   auth_codes)│
│  /organizer │     └──────────────┘
│  /checkin   │
└──────┬──────┘
       │ relayer (ORGANIZER_PRIVATE_KEY)
       ▼
┌──────────────────────────────────────────────┐
│  Arbitrum Sepolia                            │
│  BetterDevPassport · ReputationRegistry      │
│  MeetupRegistry · BuilderCircleVRF           │
└──────────────────────────────────────────────┘
```

**On-chain:** identity credentials, attendance verification, reputation events, VRF seeds  
**Off-chain:** profile data, email, phone, event names/cities, OTP codes, venue logistics

---

## Routes

| Path | Description |
|------|-------------|
| [`/`](https://betterdev.live) | Landing page + join onboarding |
| [`/login`](https://betterdev.live/login) | Email OTP login |
| [`/profile`](https://betterdev.live/profile) | Member dashboard (session required) |
| [`/join`](https://betterdev.live/join) | Opens registration flow |
| [`/invite/[slug]`](https://betterdev.live/invite) | Referral invite links |
| [`/meetup`](https://betterdev.live/meetup) | Passport, reputation, Builder Circles |
| [`/checkin`](https://betterdev.live/checkin) | Attendee QR check-in |
| [`/organizer`](https://betterdev.live/organizer) | Create event + generate QR |
| `/organizer/checkin/[meetupId]` | Regenerate check-in QR |
| `/partnership` · `/careers` · `/contact` | Community pages |

---

## Quick Start

```bash
git clone https://github.com/YOUR_ORG/betterdev.git
cd betterdev
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run contracts:compile` | Compile Solidity |
| `npm run contracts:test` | Hardhat tests |
| `npm run contracts:deploy:sepolia` | Deploy to Arbitrum Sepolia |
| `npm run contracts:export` | Export ABIs to `src/contracts/` |
| `npm run event:setup` | CLI setup for a fixed event slug |

---

## Environment Variables

Copy [`.env.example`](.env.example) to `.env.local`. Key groups:

### Storage (default: Google Sheets)

| Variable | Description |
|----------|-------------|
| `GOOGLE_SHEETS_WEBAPP_URL` | Apps Script web app URL |
| `GOOGLE_SHEETS_API_TOKEN` | Shared secret with Apps Script |
| `NEXT_PUBLIC_USE_SUPABASE` | `false` (Sheets) or `true` (Supabase) |

### Member auth

| Variable | Description |
|----------|-------------|
| `AUTH_SESSION_SECRET` | Signs member session cookies |
| `RESEND_API_KEY` | Email OTP delivery ([Resend](https://resend.com)) |
| `AUTH_EMAIL_FROM` | Verified sender, e.g. `noreply@support.betterdev.live` |

Without `RESEND_API_KEY` in development, login codes appear in the server console and login UI.

### Event flow & relayer

| Variable | Description |
|----------|-------------|
| `ARBITRUM_SEPOLIA_RPC_URL` | Arbitrum Sepolia RPC |
| `ORGANIZER_PRIVATE_KEY` | Relayer wallet (or `DEPLOYER_PRIVATE_KEY`) |
| `ORGANIZER_SESSION_SECRET` | Password for `/organizer` |
| `CHECKIN_SIGNING_SECRET` | Signs QR check-in tokens (4h TTL) |
| `PASSPORT_METADATA_BASE_URL` | `https://betterdev.live` in production |
| `NEXT_PUBLIC_BETTERDEV_PASSPORT_ADDRESS` | Deployed contract addresses |
| `NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS` | |
| `NEXT_PUBLIC_MEETUP_REGISTRY_ADDRESS` | |
| `NEXT_PUBLIC_BUILDER_CIRCLE_VRF_ADDRESS` | |

All four `NEXT_PUBLIC_*_ADDRESS` vars must be set on Vercel and **rebuilt** after adding them.

---

## Google Sheets

Deploy [`scripts/google-sheets-webapp.js`](scripts/google-sheets-webapp.js) as a Google Apps Script web app:

- **Execute as:** Me  
- **Access:** Anyone  
- Protect with `GOOGLE_SHEETS_API_TOKEN`

### Sheet tabs

**`submissions`** — member registry

```text
created_at | full_name | email | phone_e164 | country | city | x_username
| x_profile_link | followed_x | joined_community | member_number | community_id
| invite_slug | referred_by_invite_slug | source_ip | user_agent | reputation
```

**`checkins`** — attendance log

```text
created_at | meetup_id | community_id | email | wallet | attendance_tx | reputation_awarded
```

**`events`** — event metadata (name/city off-chain; short URI on-chain)

```text
created_at | slug | name | city | metadata_uri | tx_hash
```

**`auth_codes`** — email login OTP

```text
created_at | email | code | expires_at | used
```

Redeploy Apps Script after every change to `google-sheets-webapp.js`.

---

## Event Runbook

1. Set contract addresses and relayer env vars (local + Vercel).
2. Set `PASSPORT_METADATA_BASE_URL=https://betterdev.live`.
3. Redeploy Apps Script (includes `checkins`, `events`, `auth_codes`).
4. Create an event at [`/organizer`](https://betterdev.live/organizer) (name, slug, city + organizer secret).
5. Display the check-in QR at the venue (valid 4 hours; regenerate at `/organizer/checkin/[slug]` if needed).
6. Attendees scan QR → `/checkin` → enter member number (`DEV-0001`) → on-chain `verifyAttendance` (+20 reputation).
7. Members log in at `/login` to view profile, reputation, and invite link.

---

## Member Flows

### Registration

1. Join from the landing page (`/` or `/join`).
2. Onboarding validates phone and country.
3. Member stored in Google Sheets `submissions`.
4. Member receives Community ID and invite link.

### Login

1. Click the profile icon on the homepage (or go to `/login`).
2. Enter registered email → receive 6-digit code.
3. Verify code → session cookie → `/profile`.

### Check-in (no wallet required)

1. Scan organizer QR → `/checkin?meetup=&token=`.
2. Enter member number from registration.
3. Relayer calls `verifyAttendance` on-chain; reputation synced to Sheets.

---

## Smart Contracts

```text
contracts/BetterDevPassport.sol   → identity credential (ERC-721)
contracts/ReputationRegistry.sol  → contribution event ledger
contracts/MeetupRegistry.sol      → attendance verification
contracts/BuilderCircleVRF.sol    → Chainlink VRF random seed
```

```bash
npm run contracts:compile
npm run contracts:test
npm run contracts:deploy:sepolia   # requires .env.local RPC + deployer key
```

VRF flow:

```text
requestBuilderCircleRandomness(meetupId)
  → Chainlink VRF fulfills
  → contract stores randomSeed
  → app reads seed → generates Builder Circles off-chain
```

---

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Storage:** Google Sheets (MVP) · optional Supabase
- **Auth:** Email OTP + signed httpOnly session cookies
- **Email:** Resend
- **Chain:** Arbitrum Sepolia, ethers.js v6, Hardhat
- **Randomness:** Chainlink VRF v2.5

---

## Development

```bash
npx tsc --noEmit    # typecheck
npm run build       # production build
npm run lint        # eslint
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Protocol Architecture](docs/protocol-architecture.md) | Identity model, on/off-chain boundary, roadmap |
| [`.env.example`](.env.example) | Full environment variable reference |

---

## Contributing

Contributions welcome — bug fixes, docs, tests, and internship milestones.

1. Fork the repo and create a branch from `main`.
2. Keep PRs focused; run `npm run build` before opening.
3. Never commit secrets (`.env.local`, private keys).

Look for GitHub issues labeled **`good first issue`** when available.

---

## License

MIT — see [LICENSE](LICENSE) when present in the repository.

---

## Links

- **Live app:** [betterdev.live](https://betterdev.live)
- **Member login:** [betterdev.live/login](https://betterdev.live/login)
- **Organizer:** [betterdev.live/organizer](https://betterdev.live/organizer)

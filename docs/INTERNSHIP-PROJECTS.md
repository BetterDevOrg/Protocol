# BetterDev Internship Projects

Structured contributor tracks for interns and new open source contributors. Each track has milestones you can pick up as GitHub issues labeled **`good first issue`** or **`internship`**.

Maintainers: [@FrankezeCode](https://github.com/FrankezeCode), [@BetterRuth](https://github.com/BetterRuth)

---

## Track 1 — BetterDev Passport

**Goal:** Make `/meetup` a first-class member experience tied to email login (not wallet-only).

| Milestone | Deliverable |
|-----------|-------------|
| M1 | Detect email session on `/meetup`; pre-fill Community ID from `/api/auth/me` |
| M2 | Show on-chain mint status and explorer link on `/profile` |
| M3 | Passport metadata improvements (skills, city, reputation breakdown) |
| M4 | Milestone badge UI when reputation crosses thresholds |

**Skills:** Next.js, ethers.js, React  
**Key files:** `src/components/passport/meetup-passport-client.tsx`, `src/app/api/passport/mint/route.ts`, `src/app/profile/page.tsx`

---

## Track 2 — Community ID & Member Identity

**Goal:** Strengthen the universal ID layer (`DEV-0001`) across the app.

| Milestone | Deliverable |
|-----------|-------------|
| M1 | Public read-only member card page (no sensitive PII) |
| M2 | Referral stats on `/profile` (invites that converted) |
| M3 | Shareable Community ID card (Open Graph / PNG export) |
| M4 | Rate-limit and audit logging for OTP send requests |

**Skills:** Next.js, Google Sheets integration, UX  
**Key files:** `src/lib/community-id.ts`, `scripts/google-sheets-webapp.js`, `src/app/profile/page.tsx`

---

## Track 3 — Builder Circles (Chainlink VRF)

**Goal:** Live fair group assignment at meetups.

| Milestone | Deliverable |
|-----------|-------------|
| M1 | Organizer UI: request VRF randomness on-chain |
| M2 | Poll contract for fulfilled seed; show transaction on UI |
| M3 | Assign circles from seed and attendee list (deterministic shuffle) |
| M4 | Projector-friendly `/organizer/circles/[meetupId]` display page |

**Skills:** Solidity, Chainlink VRF, React  
**Key files:** `contracts/BuilderCircleVRF.sol`, `src/lib/builder-circles.ts`, `src/components/passport/meetup-passport-client.tsx`

---

## Track 4 — Reputation & Participation Scoring

**Goal:** Expand reputation beyond meetup attendance (+20).

| Milestone | Deliverable |
|-----------|-------------|
| M1 | Profile completion scorer (+10 when required fields filled) |
| M2 | Referral reputation events when an invitee registers |
| M3 | Reputation timeline on `/profile` (sources and dates) |
| M4 | Harden on-chain ↔ Sheets reputation sync on check-in |

**Skills:** API design, Google Sheets, smart contracts  
**Key files:** `contracts/ReputationRegistry.sol`, `src/lib/relayer.ts`, `scripts/google-sheets-webapp.js`

---

## Track 5 — BetterDev Publish (future)

**Goal:** Let members publish articles, recaps, and tutorials for reputation.

| Milestone | Deliverable |
|-----------|-------------|
| M1 | `/publish` form: title, URL, content type |
| M2 | Moderation queue in Google Sheets `publications` tab |
| M3 | Maintainer approval flow leading to reputation award |
| M4 | Public community feed on landing or `/community` |

**Skills:** Full-stack, content moderation UX  
**Key files:** New routes and Sheets tab (greenfield capstone)

---

## How to start

1. Read [CONTRIBUTING.md](../CONTRIBUTING.md) and [GOVERNANCE.md](../GOVERNANCE.md).
2. Pick a track and comment on a related issue (or open one describing your milestone).
3. Fork [BetterDevOrg/protocol](https://github.com/BetterDevOrg/protocol) and open a PR.

Questions? Open a [GitHub Issue](https://github.com/BetterDevOrg/protocol/issues) with the `question` label.

# Organizer Codes (Phase 4)

City organizers receive a verifiable **Organizer Code** derived from Chainlink VRF randomness and tied to their `organizer_id` (e.g. `ORG-0001`).

## Flow

1. Member applies → `organizer_code` set to **`PENDING-VRF`** in the `organizers` sheet
2. Founder sets `status` → **`active`**
3. Active organizer opens `/organizer` → **Issue VRF organizer code**
4. Relayer requests randomness on `OrganizerCodeVRF`
5. When fulfilled, app derives code from seed: `ORG-XXXXXX` (deterministic, verifiable)
6. Code synced to Google Sheets (`organizer_code`, `code_vrf_fulfilled`, `code_vrf_seed`)

## Contract

**`OrganizerCodeVRF`** — same VRF subscription pattern as `BuilderCircleVRF`.

```solidity
requestOrganizerCodeRandomness(bytes32 organizerKey)
getOrganizerCodeSeed(bytes32 organizerKey)
```

`organizerKey = keccak256(organizerId)` (via `ethers.id("ORG-0001")` in the app).

## Google Sheets columns

Add to `organizers` tab (auto-created on redeploy):

```
code_vrf_fulfilled | code_vrf_seed
```

## API

| Route | Auth | Purpose |
|-------|------|---------|
| `GET /api/organizers/[organizerId]/code` | Public (active organizers) | Code status + auto-sync from chain |
| `POST /api/organizers/[organizerId]/code` | Active organizer or founder secret | Request VRF + sync when ready |

## Deploy

Standalone (existing protocol already live):

```bash
npm run contracts:deploy:organizer-code-vrf
```

Env:

```env
NEXT_PUBLIC_ORGANIZER_CODE_VRF_ADDRESS=0x...
```

Uses the same Chainlink VRF subscription env vars as Builder Circles.

## Verification

Anyone can:

1. Read `getOrganizerCodeSeed(organizerKey)` on-chain
2. Derive the display code with the same algorithm in `src/lib/organizer-code.ts`

## Pages

- **Dashboard:** `/organizer` — issue code when active
- **Public profile:** `/organizers/ORG-0001` — shows code + VRF badge

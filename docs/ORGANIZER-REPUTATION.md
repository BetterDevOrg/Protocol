# Organizer Reputation

Organizer reputation is **separate from member reputation**. It reflects hosting and community leadership, not individual attendance.

## Point rules

| Action | Points | Event type |
|--------|--------|------------|
| Successfully create a new on-chain meetup | **+10** | `MEETUP_HOSTED` (1) |
| Run Builder Circle matching for a meetup | **+5** | `BUILDER_CIRCLES` (2) |
| Re-create / refresh existing meetup | **0** | — |

`events_hosted` in Google Sheets increments only on first event creation (off-chain counter).

## Phase 3 — on-chain registry

Contract: **`OrganizerReputationRegistry`** on Arbitrum Sepolia.

- Keyed by organizer ID (`ORG-0001`)
- Relayer records events after verified organizer actions
- **Dedupe** by `(organizerId, eventType, meetupSlug)` — no double-awards for the same meetup action
- Google Sheets remains a backup / migration cache during rollout

### Env

```env
NEXT_PUBLIC_ORGANIZER_REPUTATION_REGISTRY_ADDRESS=0x...
```

Deploy standalone (existing protocol already live):

```bash
npm run contracts:deploy:organizer-reputation
```

Then set the address in Vercel and redeploy the app. The relayer wallet (`ORGANIZER_PRIVATE_KEY`) is registered as a verifier automatically.

### Display logic

When the on-chain registry is configured, public profiles show:

`max(on-chain reputation, sheet reputation)`

New actions write to **both** chain and sheet. Once an action is recorded on-chain, retries skip duplicate awards.

## Member vs organizer reputation

| | Member reputation | Organizer reputation |
|--|-------------------|----------------------|
| **Contract** | `ReputationRegistry` | `OrganizerReputationRegistry` |
| **ID key** | `DEV-0001` (community ID) | `ORG-0001` (organizer ID) |
| **Earned by** | Attending meetups | Hosting events, Builder Circles |
| **Public on** | Passport, profile | `/organizers/[organizerId]` |

## Roadmap (Phase 4+)

- VRF-verified organizer codes tied to `organizer_id`
- Badge NFTs for organizer milestones

## Manual adjustments

Founders can still edit `organizer_reputation` in the `organizers` sheet for corrections. On-chain totals require contract owner actions or future admin tooling.

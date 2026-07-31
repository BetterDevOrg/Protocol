# Builder Circles (Phase 2)

Fair small-group matching for meetup participants. Groups are shuffled with a verifiable random seed (Chainlink VRF when available) and stored off-chain for cost and privacy.

## Requirements

| Rule | Value |
|------|--------|
| Minimum participants | **6** in the selected pool |
| City scope | Attendee profile city must match **event city** |
| Default group size | **4** per Builder Circle |
| Who can run matching | Active city organizer for the event, or founder secret |
| When to match | **Before the event** (pre-event pool) |
| QR check-in | **Attendance only** — does not gate matching |

## Participant pools

| Mode | Pool |
|------|------|
| **RSVP** (`rsvp`) | Members who RSVP'd for this meetup |
| **City** (`city`) | All members in `submissions` matching the event city |
| **Hybrid** (`hybrid`) | Union of RSVPs + city members, deduped by `communityId` (RSVP wins on overlap) |

Default mode: **hybrid**.

## Flow

```text
Organizer creates event → shares /meetup/[slug] RSVP link
Members RSVP (logged-in session) → stored in meetup_rsvps sheet
Organizer opens /organizer/circles/[meetupId]
Eligibility panel shows RSVPs, city members, hybrid pool, venue check-ins
Organizer picks pool mode and runs matching (optional VRF request)
App shuffles eligible participants → groups of 4
Assignment saved to builder_circles sheet → emails sent to matched members
At event: QR check-in verifies attendance (+ reputation)
Attendees view groups at /meetup/[meetupId]/circles
```

## Google Sheets tabs

### `meetup_rsvps`

```
created_at | meetup_id | community_id | email | full_name | city | country | x_username
```

### `builder_circles`

```
created_at | meetup_id | organizer_id | city | attendee_count | group_size | vrf_seed | vrf_fulfilled | circles_json | status
```

`circles_json` stores:

```json
{
  "circles": [
    {
      "id": "Group 1",
      "members": [
        { "communityId": "DEV-0001", "fullName": "Ada", "city": "Lagos", "role": "@ada" }
      ]
    }
  ]
}
```

## Apps Script actions

- `GET ?action=meetupRsvps&meetupId=` — RSVPs for a meetup
- `GET ?action=membersByCity&city=` — all submissions members in a city
- `POST { action: "meetupRsvp", ... }` — record RSVP (deduped)
- `GET ?action=meetupCheckins&meetupId=` — venue check-ins (attendance)
- `GET ?action=builderCircles&meetupId=` — stored assignment
- `POST { action: "builderCirclesStore", ... }` — save assignment

## API

| Route | Auth | Purpose |
|-------|------|---------|
| `GET /api/meetups/[meetupId]/rsvp` | Public | Event + RSVP list; `?communityId=` for RSVP status |
| `POST /api/meetups/[meetupId]/rsvp` | Member session | Record RSVP |
| `GET /api/meetups/[meetupId]/builder-circles` | Public | Assignment + optional `?communityId=` for my group |
| `GET ...?eligibility=true&poolMode=` | Organizer secret | Pre-run stats |
| `POST /api/meetups/[meetupId]/builder-circles` | Organizer | Run matching (`poolMode`, `requestVrf` optional) |

## VRF integration

When contracts are configured and `requestVrf: true`:

1. Relayer calls `BuilderCircleVRF.requestBuilderCircleRandomness`
2. If fulfilled, seed comes from chain (`getMeetupSeed`)
3. If still pending, matching uses server random seed and `vrf_fulfilled=false`

Re-run matching after VRF fulfills to upgrade to on-chain verified seed.

## Email notifications

After matching succeeds, each assigned member with an email receives their group assignment and a link to `/meetup/[meetupId]/circles`.

Requires `RESEND_API_KEY` (falls back to console logging in dev).

## Organizer reputation

Running Builder Circle matching awards **+5 organizer reputation** (does not increment `events_hosted`). See [ORGANIZER-REPUTATION.md](./ORGANIZER-REPUTATION.md).

## Pages

- **RSVP:** `/meetup/[meetupId]`
- **Organizer:** `/organizer/circles/[meetupId]`
- **Attendee groups:** `/meetup/[meetupId]/circles`

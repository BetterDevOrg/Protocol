# City Organizers (City Co-Leads)

BetterDev city organizers — **City Co-Leads** — host local meetups in an assigned city and country. They are linked to an existing member Community ID and receive a separate **Organizer ID**, **Organizer Code**, and a **private organizer key**.

## Roles

| Role | Scope | Auth |
|------|--------|------|
| **Member** | Join community, earn member reputation | Email OTP → member session |
| **City organizer** | Create events in assigned city only | Unique **organizer key** (`org_…`) after founder approval |
| **Founder / ops** | Approve applicants, any city override | `ORGANIZER_SESSION_SECRET` |

## Application flow

1. **Join** as a member at `/join`.
2. **Sign in** at `/login`.
3. **Apply** at `/organizer` — application only (city, country, bio).
4. Founders receive an email at `ORGANIZER_FOUNDER_EMAIL` (default `betterdevcommunity.team@gmail.com`).
5. After interview/vetting, founder **approves** via API (generates unique organizer key).
6. Applicant receives email with organizer key + link to `/organizer/create`.
7. Organizer creates events, QR codes, Builder Circles using their private key.
8. Public profile at `/organizers` and `/organizers/ORG-0001`.

## Pages

| URL | Purpose |
|-----|---------|
| `/organizer` | Apply (login required) or pending/approved status |
| `/organizer/create` | Create events — requires private organizer key |
| `/organizer/checkin/[slug]` | Regenerate check-in QR |
| `/organizer/circles/[slug]` | Builder Circle matching |

## Founder approval

After vetting an applicant, call:

```bash
curl -X POST https://betterdev.live/api/organizers/ORG-0001/approve \
  -H "Content-Type: application/json" \
  -d '{"founderSecret":"YOUR_ORGANIZER_SESSION_SECRET"}'
```

This will:

- Set `status` → `active` and `approved_at` in the sheet
- Generate a unique `organizer_secret` (if not already set)
- Email the applicant their key and `/organizer/create` link
- Return `{ organizerSecret, createUrl }` in the JSON response (for manual follow-up)

## Google Sheets: `organizers` tab

```
created_at | community_id | email | full_name | organizer_id | organizer_code | city | country | status | organizer_reputation | events_hosted | x_username | bio | approved_at | code_vrf_fulfilled | code_vrf_seed | organizer_secret
```

| Column | Description |
|--------|-------------|
| `organizer_id` | e.g. `ORG-0001` (auto-assigned on apply) |
| `organizer_code` | VRF-derived when fulfilled, else `PENDING-VRF` |
| `organizer_secret` | Unique private key — generated on approval, never shown publicly |
| `status` | `pending`, `active`, or `suspended` |

**Do not** manually set `status = active` without generating `organizer_secret` — use the approve API instead.

## Google Sheets: `events` tab (extended)

```
organizer_id | country
```

## Deploy Apps Script

Redeploy **`scripts/google-sheets-webapp.js`** after pulling this change.

New/updated API actions:

- `GET ?action=organizerBySecret&secret=`
- `POST { action: "organizerActivate", organizerId }`
- `POST { action: "organizerApply", ... }` — emails founder on new applications

## API routes

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /api/organizers/apply` | Member session | Submit application + notify founder |
| `POST /api/organizers/[organizerId]/approve` | Founder secret | Activate + generate organizer key + email applicant |
| `POST /api/organizers/session` | Organizer key | Validate key, return profile + events |
| `POST /api/meetups/create` | Organizer key or founder secret | Create on-chain event |
| `POST /api/meetups/session` | Organizer key or founder secret | Regenerate check-in QR |
| `GET /api/organizers/me` | Member session | Check application status on `/organizer` |

## City enforcement

Organizers with a private key may only create events where **city** matches their assignment. Founders using `ORGANIZER_SESSION_SECRET` bypass city scope.

## Env

```env
ORGANIZER_SESSION_SECRET=       # Founder ops + approve API
ORGANIZER_FOUNDER_EMAIL=        # Application notifications (default: betterdevcommunity.team@gmail.com)
RESEND_API_KEY=                 # Required for production emails
```

## Later phases

- ~~**Phase 2** — Builder Circle matching~~ — [BUILDER-CIRCLES.md](./BUILDER-CIRCLES.md)
- ~~**Phase 3** — On-chain organizer reputation~~ — [ORGANIZER-REPUTATION.md](./ORGANIZER-REPUTATION.md)
- ~~**Phase 4** — VRF-backed organizer codes~~ — [ORGANIZER-CODES.md](./ORGANIZER-CODES.md)

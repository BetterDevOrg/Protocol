# Creates 20 "good first issue" labels on BetterDevOrg/Protocol.
# Prerequisites: gh auth login
# Usage: pwsh -File scripts/create-good-first-issues.ps1

$ErrorActionPreference = "Stop"
$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) {
  $gh = (Get-Command gh -ErrorAction SilentlyContinue).Source
}
if (-not $gh) {
  throw "GitHub CLI (gh) not found. Install: winget install GitHub.cli"
}

& $gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Not logged in. Run: gh auth login"
}

$ErrorActionPreference = "Continue"
& $gh label create "good first issue" --description "Good for newcomers" --color "7057ff" 2>$null | Out-Null
$ErrorActionPreference = "Stop"

$issues = @(
  @{
    Title = "[Good first issue] Add missing contract env vars to .env.example"
    Body  = @"
## Summary
Document meetup passport and milestone badge contract addresses in the env template.

## Acceptance criteria
- [ ] Add ``NEXT_PUBLIC_MEETUP_PASSPORT_ADDRESS`` with comment
- [ ] Add ``NEXT_PUBLIC_MILESTONE_BADGE_ADDRESS`` with comment
- [ ] Update ``PASSPORT_METADATA_BASE_URL`` default to https://betterdev.live

## Files
- ``.env.example``
"@
  },
  @{
    Title = "[Good first issue] Document milestone badge mint flow"
    Body  = @"
## Summary
Add docs for milestone badge unlock rules, mint API, and deploy steps.

## Acceptance criteria
- [ ] New ``docs/MILESTONE-BADGES.md``
- [ ] Covers unlock rules, POST/GET ``/api/badges/mint``, demo vs on-chain mode

## Files
- ``docs/MILESTONE-BADGES.md``, ``src/lib/milestone-badges.ts``
"@
  },
  @{
    Title = "[Good first issue] Add local testing checklist to README"
    Body  = @"
## Summary
Step-by-step guide for testing join → login → meetup → profile → badge mint locally.

## Acceptance criteria
- [ ] README section with numbered test flow
- [ ] Mentions ``.env.local`` requirements
"@
  },
  @{
    Title = "[Good first issue] Clean up duplicate .env.example sections"
    Body  = @"
## Summary
Remove duplicate GOOGLE_SHEETS blocks and ensure placeholders only (no real addresses).

## Acceptance criteria
- [ ] Single clean env template
- [ ] No production-looking addresses in example file
"@
  },
  @{
    Title = "[Good first issue] Unit tests for milestone badge eligibility"
    Body  = @"
## Summary
Test ``getMilestoneBadgeEligibility`` and ``getMilestoneBadgeDisplayStatus``.

## Acceptance criteria
- [ ] ``test/MilestoneBadges.ts`` with locked/ready/minted cases
- [ ] ``npm run test:unit`` passes
"@
  },
  @{
    Title = "[Good first issue] Unit tests for meetup-route-metadata"
    Body  = @"
## Summary
Add tests for meetup page title/description helper.

## Acceptance criteria
- [ ] ``test/MeetupRouteMetadata.ts``
- [ ] ``npm run test:unit`` passes
"@
  },
  @{
    Title = "[Good first issue] Unit tests for milestone badge metadata URI builder"
    Body  = @"
## Summary
Test ``buildMilestoneBadgeMetadataUri`` output format.

## Acceptance criteria
- [ ] Correct URL with encoded community ID
- [ ] ``npm run test:unit`` passes
"@
  },
  @{
    Title = "[Good first issue] Extend CommunityId unit tests"
    Body  = @"
## Summary
Add edge-case tests for invalid community IDs.

## Acceptance criteria
- [ ] Empty, malformed, lowercase, overlong inputs covered
- [ ] ``npm run test:unit`` passes
"@
  },
  @{
    Title = "[Good first issue] Add page titles for /profile and /login"
    Body  = @"
## Summary
Add metadata/layout titles like meetup routes (PR #70).

## Acceptance criteria
- [ ] Browser tab shows BetterDev Profile / Sign in
- [ ] Sensible meta descriptions
"@
  },
  @{
    Title = "[Good first issue] Next badge nudge after check-in success"
    Body  = @"
## Summary
After attendance verification, show rep progress toward next milestone badge.

## Acceptance criteria
- [ ] Uses ``getNextMilestoneBadge()``
- [ ] Visible on meetup passport check-in success UI
"@
  },
  @{
    Title = "[Good first issue] Success feedback after milestone NFT mint"
    Body  = @"
## Summary
Toast or banner on successful badge mint with explorer link.

## Acceptance criteria
- [ ] Shown after POST ``/api/badges/mint`` succeeds
- [ ] Link to Arbiscan when mintTx present
"@
  },
  @{
    Title = "[Good first issue] Skeleton loaders for profile trophy case"
    Body  = @"
## Summary
Replace spinner-only loading with badge card skeletons.

## Acceptance criteria
- [ ] 4-card skeleton grid on ``/profile``
- [ ] Matches MilestoneBadgeCard layout
"@
  },
  @{
    Title = "[Good first issue] Empty state for /organizers list"
    Body  = @"
## Summary
Friendly empty state when no city organizers exist.

## Acceptance criteria
- [ ] CTA to apply at ``/organizer``
- [ ] Does not look like a broken page
"@
  },
  @{
    Title = "[Good first issue] On-chain passport link on /profile"
    Body  = @"
## Summary
Show token ID and Arbiscan link when passport is minted (Internship Track 1 M2).

## Acceptance criteria
- [ ] Reads mint status from API
- [ ] Explorer link when on-chain mint exists
"@
  },
  @{
    Title = "[Good first issue] Reusable copy-link button on meetup RSVP"
    Body  = @"
## Summary
Extract duplicated copy-link logic into one component.

## Acceptance criteria
- [ ] Shared CopyLinkButton component
- [ ] Used on ``/meetup/[meetupId]`` with consistent Copied/error states
"@
  },
  @{
    Title = "[Good first issue] Redirect stub /organizer/[organizerId] to /organizers"
    Body  = @"
## Summary
Avoid confusion between stub organizer page and full public profile.

## Acceptance criteria
- [ ] ``/organizer/[id]`` redirects to ``/organizers/[id]`` OR stub removed
"@
  },
  @{
    Title = "[Good first issue] aria-live for profile copy buttons"
    Body  = @"
## Summary
Announce copy success/errors to screen readers.

## Acceptance criteria
- [ ] aria-live region for Community ID and invite link copy
- [ ] Works with keyboard-only use
"@
  },
  @{
    Title = "[Good first issue] Focus-visible styles on milestone mint buttons"
    Body  = @"
## Summary
Visible keyboard focus rings on mint CTAs.

## Acceptance criteria
- [ ] focus-visible ring on MilestoneBadgeMintActions buttons
- [ ] Matches existing brand focus patterns
"@
  },
  @{
    Title = "[Good first issue] Reduced motion for contributor carousel"
    Body  = @"
## Summary
Wire use-reduced-motion to disable carousel animation when preferred.

## Acceptance criteria
- [ ] Respects prefers-reduced-motion
- [ ] Carousel still usable without animation
"@
  },
  @{
    Title = "[Good first issue] Rate-limit OTP send endpoint"
    Body  = @"
## Summary
Prevent spam on POST ``/api/auth/send-code`` (Internship Track 2 M4).

## Acceptance criteria
- [ ] Rate limit per email (e.g. 3 per 10 min)
- [ ] Returns 429 with clear message
"@
  }
)

$created = @()
foreach ($issue in $issues) {
  $bodyFile = [System.IO.Path]::GetTempFileName()
  try {
    Set-Content -Path $bodyFile -Value $issue.Body -Encoding UTF8
    $url = & $gh issue create --title $issue.Title --label "good first issue" --body-file $bodyFile
    if ($LASTEXITCODE -ne 0) { throw "gh issue create failed for: $($issue.Title)" }
    $created += $url
    Write-Host "Created: $url"
  } finally {
    Remove-Item $bodyFile -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "`nDone. Created $($created.Count) issues."

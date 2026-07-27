# Good first issues — create on GitHub

Run from repo root (requires [GitHub CLI](https://cli.github.com/) and `gh auth login`):

```bash
REPO=BetterDevOrg/protocol

gh label create "good first issue" --color "7057ff" --description "Good for newcomers" --repo "$REPO" 2>/dev/null || true
gh label create "documentation" --color "0075ca" --description "Documentation improvements" --repo "$REPO" 2>/dev/null || true
gh label create "enhancement" --color "a2eeef" --description "New feature or improvement" --repo "$REPO" 2>/dev/null || true
gh label create "bug" --color "d73a4a" --description "Something broken" --repo "$REPO" 2>/dev/null || true
gh label create "help wanted" --color "008672" --description "Extra attention welcome" --repo "$REPO" 2>/dev/null || true
gh label create "accessibility" --color "f9d0c4" --description "Accessibility improvements" --repo "$REPO" 2>/dev/null || true
gh label create "internship" --color "fbca04" --description "Internship track milestone" --repo "$REPO" 2>/dev/null || true

gh issue create --repo "$REPO" --title "Add View profile link on check-in success page" --label "good first issue,enhancement" --body "## Summary
After a successful meetup check-in, add a link to \`/profile\` next to Open Passport.

## Acceptance criteria
- [ ] Success screen shows a View profile link styled consistently with existing links
- [ ] Link goes to \`/profile\`
- [ ] No layout break on mobile

## Files
\`src/app/checkin/page.tsx\`

## How to test
Complete a check-in and confirm both Open Passport and View profile appear on success."

gh issue create --repo "$REPO" --title "Add Resend code button on login step 2" --label "good first issue,enhancement" --body "## Summary
On \`/login\`, add a Resend code button on the 6-digit code step.

## Acceptance criteria
- [ ] Button calls POST /api/auth/send-code with the same email
- [ ] Shows loading state and success/error feedback
- [ ] Does not clear the email when resending

## Files
\`src/app/login/page.tsx\`"

gh issue create --repo "$REPO" --title "Add loading skeleton to profile page" --label "good first issue,enhancement" --body "## Summary
Replace plain Loading profile text with a skeleton UI matching the profile card.

## Acceptance criteria
- [ ] Skeleton visible while /api/auth/me loads
- [ ] Matches dark theme
- [ ] No flash of unstyled content after load

## Files
\`src/app/profile/page.tsx\`"

gh issue create --repo "$REPO" --title "Add aria-live region for login error messages" --label "good first issue,accessibility" --body "## Summary
Announce login errors to screen readers using aria-live on the error container.

## Acceptance criteria
- [ ] Error region has role=alert or aria-live=polite
- [ ] Invalid email/code errors are announced

## Files
\`src/app/login/page.tsx\`"

gh issue create --repo "$REPO" --title "Extend Community ID unit tests" --label "good first issue,enhancement" --body "## Summary
Add test cases for edge cases in src/lib/community-id.ts.

## Acceptance criteria
- [ ] At least 5 new assertions in test/CommunityId.ts
- [ ] Covers invalid inputs not already tested

## Files
\`test/CommunityId.ts\`, \`src/lib/community-id.ts\`"

gh issue create --repo "$REPO" --title "Extract formatJoinDate helper with unit test" --label "good first issue,enhancement" --body "## Summary
Extract formatJoinDate from profile page into src/lib/format-date.ts and add a unit test.

## Acceptance criteria
- [ ] Helper exported from src/lib/format-date.ts
- [ ] Profile page imports it with no behavior change
- [ ] Test covers valid ISO and invalid fallback

## Files
\`src/app/profile/page.tsx\`, new \`src/lib/format-date.ts\`"

gh issue create --repo "$REPO" --title "Improve account nav aria-label when session loads" --label "good first issue,accessibility" --body "## Summary
Ensure mobile/sidebar account icon aria-label reflects Log in vs Profile after session check.

## Acceptance criteria
- [ ] aria-label updates after /api/auth/me resolves
- [ ] Works for sidebar and mobile variants

## Files
\`src/components/landing/account-nav-button.tsx\`"

echo "Done. View issues: https://github.com/$REPO/issues"
```

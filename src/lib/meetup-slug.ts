const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 64;

export function slugifyFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH);
}

export function normalizeMeetupSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateMeetupSlug(slug: string): string | null {
  const normalized = normalizeMeetupSlug(slug);
  if (normalized.length < 3) {
    return "Event slug must be at least 3 characters.";
  }
  if (normalized.length > MAX_SLUG_LENGTH) {
    return `Event slug must be at most ${MAX_SLUG_LENGTH} characters.`;
  }
  if (!SLUG_PATTERN.test(normalized)) {
    return "Event slug may only use lowercase letters, numbers, and hyphens.";
  }
  return null;
}

/** Short on-chain pointer; name/city live off-chain (Google Sheets events tab). */
export function buildMeetupMetadataUri(origin: string, slug: string): string {
  return new URL(`/api/meetups/${slug}/metadata`, origin.replace(/\/$/, "")).toString();
}

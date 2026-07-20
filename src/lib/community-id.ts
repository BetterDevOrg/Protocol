const COMMUNITY_ID_PATTERN = /^DEV-\d{4}$/;

export const COMMUNITY_ID_PREFIX = "DEV-";

export function normalizeCommunityId(raw: string): string {
  return raw.trim().toUpperCase();
}

/** Build DEV-0001 from the numeric part (e.g. "1" → DEV-0001, "0001" → DEV-0001). */
export function formatCommunityIdFromNumber(rawNumber: string): string {
  const digits = rawNumber.replace(/\D/g, "");
  if (!digits) return "";
  const padded = digits.slice(-4).padStart(4, "0");
  return `${COMMUNITY_ID_PREFIX}${padded}`;
}

export function sanitizeMemberNumberInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 4);
}

export function validateCommunityId(communityId: string): string | null {
  const normalized = normalizeCommunityId(communityId);
  if (!COMMUNITY_ID_PATTERN.test(normalized)) {
    return "Community ID must look like DEV-0001.";
  }
  return null;
}

export function validateMemberNumberInput(memberNumber: string): string | null {
  const digits = sanitizeMemberNumberInput(memberNumber);
  if (!digits) {
    return "Enter your member number (e.g. 0001).";
  }
  return validateCommunityId(formatCommunityIdFromNumber(digits));
}

export function isValidCommunityId(communityId: string): boolean {
  return validateCommunityId(communityId) === null;
}

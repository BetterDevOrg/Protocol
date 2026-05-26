export function generateInviteSlug(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  }
  return Math.random().toString(36).slice(2, 12);
}

export function inviteUrl(origin: string, slug: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/invite/${slug}`;
}

/** @deprecated Use inviteUrl with DB slug */
export function generateInviteLink(origin: string): string {
  return inviteUrl(origin, generateInviteSlug());
}

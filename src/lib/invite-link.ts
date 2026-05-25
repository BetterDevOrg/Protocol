/** Deterministic-looking invite token for mock UI until Supabase assigns real slugs. */
export function generateInviteLink(origin: string): string {
  const token =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  const base = origin.replace(/\/$/, "");
  return `${base}/invite/${token}`;
}

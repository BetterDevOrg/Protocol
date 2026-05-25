import type { Member, RegistrationPayload } from "@/types/member";
import { generateInviteLink } from "@/lib/invite-link";

const STORAGE_KEY = "betterdev_member_seq";

function nextSequence(): number {
  if (typeof window === "undefined") return 42;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  const prev = raw ? parseInt(raw, 10) : 0;
  const next = Number.isFinite(prev) ? prev + 1 : 1;
  sessionStorage.setItem(STORAGE_KEY, String(next));
  return next;
}

/** Assign DEV-XXXX + human Member # — mock until Supabase insert returns row. */
export function assignCommunityId(): { communityId: string; memberDisplay: string } {
  const n = typeof window === "undefined" ? 42 : nextSequence();
  const padded = String(n).padStart(4, "0");
  return {
    communityId: `DEV-${padded}`,
    memberDisplay: String(n).padStart(4, "0"),
  };
}

export function registerMember(payload: RegistrationPayload, origin: string): Member {
  void payload;
  const { communityId, memberDisplay } = assignCommunityId();
  return {
    communityId,
    memberDisplay,
    joinDate: new Date().toISOString(),
    reputation: 0,
    inviteLink: generateInviteLink(origin),
  };
}

import type { Member } from "@/types/member";

/** Simulated registration until Supabase is connected. */
export function createMockMember(_payload: unknown): Member {
  void _payload;
  return {
    communityId: "DEV-0001",
    joinDate: new Date().toISOString(),
    reputation: 0,
  };
}

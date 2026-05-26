import type { Member, RegistrationPayload } from "@/types/member";
import { inviteUrl } from "@/lib/invite-link";
import { registerMember as registerMockMember } from "@/lib/mock-member";
import type { MemberRow } from "@/lib/supabase/types";

export function memberRowToMember(row: MemberRow, origin: string): Member {
  return {
    id: row.id,
    communityId: row.community_id,
    memberDisplay: String(row.member_number).padStart(4, "0"),
    joinDate: row.joined_at,
    reputation: row.reputation,
    inviteLink: inviteUrl(origin, row.invite_slug),
    fullName: row.full_name,
    email: row.email,
    city: row.city,
    country: row.country,
    phoneE164: row.phone_e164 ?? undefined,
    xHandle: row.x_handle,
  };
}

async function validateWithServer(
  origin: string,
  phone: string,
  country: string,
): Promise<string> {
  const res = await fetch(`${origin}/api/members/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, country }),
  });

  const body = (await res.json()) as { phoneE164?: string; error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? "Phone or location could not be verified.");
  }
  if (!body.phoneE164) {
    throw new Error("Validation failed.");
  }
  return body.phoneE164;
}

export async function registerMember(payload: RegistrationPayload, origin: string): Promise<Member> {
  const phoneE164 = await validateWithServer(origin, payload.phone, payload.country);
  const payloadWithPhone = { ...payload, phone: phoneE164 };

  const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === "true";
  if (!useSupabase) {
    return registerMockMember(payloadWithPhone, origin);
  }

  const res = await fetch(`${origin}/api/members/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloadWithPhone),
  });

  let body: { member?: Member; error?: string } = {};
  try {
    body = (await res.json()) as { member?: Member; error?: string };
  } catch {
    throw new Error("Registration service is unavailable. Try again shortly.");
  }

  if (!res.ok) {
    throw new Error(body.error ?? "Registration failed. Please try again.");
  }

  if (!body.member) {
    throw new Error("Invalid response from server");
  }

  return body.member;
}

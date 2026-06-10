import { appendMemberToGoogleSheets } from "@/lib/google-sheets/client";
import { inviteUrl } from "@/lib/invite-link";
import type { Member, RegistrationPayload } from "@/types/member";

export function googleSheetsMemberToMember(
  row: {
    memberNumber: number;
    communityId: string;
    memberDisplay: string;
    joinDate: string;
    inviteSlug: string;
    fullName: string;
    email: string;
    phoneE164: string;
    country: string;
    city: string;
    xUsername: string;
  },
  origin: string,
): Member {
  return {
    communityId: row.communityId,
    memberDisplay: row.memberDisplay,
    joinDate: row.joinDate,
    reputation: 0,
    inviteLink: inviteUrl(origin, row.inviteSlug),
    fullName: row.fullName,
    email: row.email,
    city: row.city,
    country: row.country,
    phoneE164: row.phoneE164,
    xHandle: row.xUsername,
  };
}

export async function registerMemberViaGoogleSheets(
  payload: RegistrationPayload,
  phoneE164: string,
  origin: string,
  meta: { sourceIp?: string | null; userAgent?: string | null },
): Promise<Member> {
  const result = await appendMemberToGoogleSheets({
    fullName: payload.fullName,
    email: payload.email,
    phoneE164,
    country: payload.country,
    city: payload.city,
    xUsername: payload.xUsername,
    xProfileLink: payload.xProfileLink ?? "",
    followedX: payload.followedX ?? false,
    joinedCommunity: payload.joinedCommunity ?? false,
    referredByInviteSlug: payload.referredByInviteSlug ?? "",
    sourceIp: meta.sourceIp ?? "",
    userAgent: meta.userAgent ?? "",
  });

  if (!result.ok) {
    const message = result.error ?? "Could not save your registration.";
    if (message.toLowerCase().includes("already registered")) {
      throw new Error("This email is already registered. Use another email or contact us.");
    }
    throw new Error(message);
  }

  if (!result.member) {
    throw new Error(
      "Google Sheets script must be updated. Copy scripts/google-sheets-webapp.js into Apps Script and redeploy.",
    );
  }

  return googleSheetsMemberToMember(result.member, origin);
}

import {
  findMemberByCommunityIdInGoogleSheets,
  findMemberByEmailInGoogleSheets,
} from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { googleSheetsMemberToMember } from "@/lib/google-sheets/register";
import type { Member } from "@/types/member";

async function lookupMemberFromSheets(
  lookup: { email?: string; communityId?: string },
  origin: string,
): Promise<Member | null> {
  if (!isGoogleSheetsConfigured()) {
    throw new Error("Google Sheets is not configured.");
  }

  const result = lookup.communityId
    ? await findMemberByCommunityIdInGoogleSheets(lookup.communityId)
    : await findMemberByEmailInGoogleSheets(lookup.email ?? "");

  if (!result.ok) {
    if (result.error === "not found") return null;
    throw new Error(result.error);
  }

  return googleSheetsMemberToMember(result.member, origin);
}

export async function lookupMemberByEmail(email: string, origin: string): Promise<Member | null> {
  return lookupMemberFromSheets({ email }, origin);
}

export async function lookupMemberByCommunityId(
  communityId: string,
  origin: string,
): Promise<Member | null> {
  return lookupMemberFromSheets({ communityId }, origin);
}

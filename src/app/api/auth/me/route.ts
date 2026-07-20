import { findMemberByEmailInGoogleSheets } from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { googleSheetsMemberToMember } from "@/lib/google-sheets/register";
import { readMemberSessionFromCookies } from "@/lib/member-session";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await readMemberSessionFromCookies();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    const memberResult = await findMemberByEmailInGoogleSheets(session.email);
    if (!memberResult.ok || !memberResult.member) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const origin = new URL(request.url).origin;
    return NextResponse.json({
      authenticated: true,
      member: googleSheetsMemberToMember(memberResult.member, origin),
    });
  } catch (e) {
    console.error("[auth/me]", e);
    return NextResponse.json({ error: "Could not load profile." }, { status: 500 });
  }
}

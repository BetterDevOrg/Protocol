import { findMemberByEmailInGoogleSheets } from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { googleSheetsMemberToMember } from "@/lib/google-sheets/register";
import { NextResponse } from "next/server";

/** Read member from Google Sheet by email (source of truth when Sheets mode is active). */
export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  if (process.env.NEXT_PUBLIC_USE_SUPABASE === "true") {
    return NextResponse.json({ error: "Lookup is only available in Google Sheets mode." }, { status: 501 });
  }

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    const result = await findMemberByEmailInGoogleSheets(email);
    if (!result.ok) {
      const status = result.error === "not found" ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    const origin = new URL(request.url).origin;
    return NextResponse.json({ member: googleSheetsMemberToMember(result.member, origin) });
  } catch (e) {
    console.error("[members/lookup]", e);
    return NextResponse.json({ error: "Could not load member." }, { status: 500 });
  }
}

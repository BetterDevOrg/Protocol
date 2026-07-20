import { isValidLoginEmail, normalizeLoginEmail } from "@/lib/auth-otp";
import {
  findMemberByEmailInGoogleSheets,
  verifyAuthCodeInGoogleSheets,
} from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { googleSheetsMemberToMember } from "@/lib/google-sheets/register";
import { attachMemberSessionCookie } from "@/lib/member-session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_USE_SUPABASE === "true") {
    return NextResponse.json({ error: "Email login is only available in Google Sheets mode." }, { status: 501 });
  }

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  if (!process.env.AUTH_SESSION_SECRET?.trim()) {
    return NextResponse.json({ error: "Member login is not configured." }, { status: 503 });
  }

  let body: { email?: string; code?: string };
  try {
    body = (await request.json()) as { email?: string; code?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = normalizeLoginEmail(body.email ?? "");
  const code = String(body.code ?? "").trim();

  if (!isValidLoginEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
  }

  try {
    const verifyResult = await verifyAuthCodeInGoogleSheets({ email, code });
    if (!verifyResult.ok) {
      return NextResponse.json({ error: verifyResult.error ?? "Could not verify code." }, { status: 502 });
    }

    if (!verifyResult.valid) {
      return NextResponse.json({ error: "Invalid or expired code. Request a new one." }, { status: 401 });
    }

    const memberResult = await findMemberByEmailInGoogleSheets(email);
    if (!memberResult.ok || !memberResult.member) {
      return NextResponse.json({ error: "Member record not found." }, { status: 404 });
    }

    const origin = new URL(request.url).origin;
    const member = googleSheetsMemberToMember(memberResult.member, origin);
    const response = NextResponse.json({ ok: true, member });
    attachMemberSessionCookie(response, email, member.communityId);
    return response;
  } catch (e) {
    console.error("[auth/verify-code]", e);
    return NextResponse.json({ error: "Could not verify login code." }, { status: 500 });
  }
}

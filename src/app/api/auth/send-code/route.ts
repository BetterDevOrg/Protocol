import { sendLoginCodeEmail } from "@/lib/auth-email";
import { generateLoginCode, isValidLoginEmail, normalizeLoginEmail, otpExpiresAtIso } from "@/lib/auth-otp";
import {
  findMemberByEmailInGoogleSheets,
  storeAuthCodeInGoogleSheets,
} from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const SEND_CODE_RATE_LIMIT = 3;
const SEND_CODE_RATE_WINDOW_MS = 10 * 60 * 1000;

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

  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = normalizeLoginEmail(body.email ?? "");
  if (!isValidLoginEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const rateLimit = checkRateLimit(`send-code:${email}`, SEND_CODE_RATE_LIMIT, SEND_CODE_RATE_WINDOW_MS);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many login code requests for this email. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  try {
    const memberResult = await findMemberByEmailInGoogleSheets(email);
    if (!memberResult.ok) {
      const status = memberResult.error === "not found" ? 404 : 400;
      return NextResponse.json(
        { error: "No BetterDev account found for this email. Join first, then log in." },
        { status },
      );
    }

    const code = generateLoginCode();
    const storeResult = await storeAuthCodeInGoogleSheets({
      email,
      code,
      expiresAt: otpExpiresAtIso(),
    });

    if (!storeResult.ok) {
      return NextResponse.json(
        {
          error:
            storeResult.error ??
            "Could not store login code. Redeploy scripts/google-sheets-webapp.js in Apps Script.",
        },
        { status: 502 },
      );
    }

    const emailResult = await sendLoginCodeEmail(email, code);
    const response: Record<string, unknown> = {
      ok: true,
      message: emailResult.sent
        ? "Check your email for a 6-digit code."
        : "Login code generated. Check server logs in development.",
    };
    if (emailResult.devCode && process.env.NODE_ENV === "development") {
      response.devCode = emailResult.devCode;
    }

    return NextResponse.json(response);
  } catch (e) {
    console.error("[auth/send-code]", e);
    const message = e instanceof Error ? e.message : "Could not send login code.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

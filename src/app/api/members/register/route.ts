import { generateInviteSlug } from "@/lib/invite-link";
import { BETTERDEV_COUNTRIES } from "@/lib/constants";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { registerMemberViaGoogleSheets } from "@/lib/google-sheets/register";
import { memberRowToMember } from "@/lib/members";
import { createServiceClient } from "@/lib/supabase/service";
import {
  ipCountryIsoFromHeaders,
  isBetterDevCountry,
  validateRegistration,
} from "@/lib/phone-validation";
import type { RegistrationPayload } from "@/types/member";
import { NextResponse } from "next/server";

const ALLOWED_COUNTRIES: ReadonlySet<string> = new Set(
  BETTERDEV_COUNTRIES.map((c) => c.value).filter((v) => v.length > 0),
);

function validate(payload: unknown): RegistrationPayload | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const fullName = typeof p.fullName === "string" ? p.fullName.trim() : "";
  const email = typeof p.email === "string" ? p.email.trim().toLowerCase() : "";
  const phone = typeof p.phone === "string" ? p.phone.trim() : "";
  const city = typeof p.city === "string" ? p.city.trim() : "";
  const country = typeof p.country === "string" ? p.country.trim() : "";
  const xUsername = typeof p.xUsername === "string" ? p.xUsername.trim().replace(/^@/, "") : "";
  const xProfileLink = typeof p.xProfileLink === "string" ? p.xProfileLink.trim() : undefined;
  const screenshotFileName =
    typeof p.screenshotFileName === "string" ? p.screenshotFileName : undefined;
  const followedX = p.followedX === true;
  const joinedCommunity = p.joinedCommunity === true;

  if (!fullName || !email.includes("@") || !phone || !city || !xUsername || !country) return null;
  if (!ALLOWED_COUNTRIES.has(country) || !isBetterDevCountry(country)) return null;

  return {
    fullName,
    email,
    phone,
    city,
    country,
    xUsername,
    xProfileLink: xProfileLink || undefined,
    screenshotFileName: screenshotFileName ?? undefined,
    followedX,
    joinedCommunity,
  };
}

function requestMeta(request: Request) {
  return {
    sourceIp:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null,
    userAgent: request.headers.get("user-agent"),
  };
}

export async function POST(request: Request) {
  try {
    const payload = validate(await request.json());
    if (!payload) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    const phoneCheck = validateRegistration({
      phone: payload.phone,
      country: payload.country,
      ipCountryIso: ipCountryIsoFromHeaders(request.headers),
    });
    if (!phoneCheck.ok) {
      return NextResponse.json({ error: phoneCheck.error }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === "true";

    if (useSupabase) {
      const supabase = createServiceClient();
      const inviteSlug = generateInviteSlug();

      const { data, error } = await supabase
        .from("members")
        .insert({
          full_name: payload.fullName,
          email: payload.email,
          phone_e164: phoneCheck.phoneE164,
          city: payload.city,
          country: payload.country,
          x_handle: payload.xUsername,
          x_profile_link: payload.xProfileLink ?? null,
          screenshot_file_name: payload.screenshotFileName ?? null,
          followed_x: payload.followedX ?? false,
          joined_community: payload.joinedCommunity ?? false,
          invite_slug: inviteSlug,
          reputation: 0,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return NextResponse.json(
            { error: "This email is already registered. Use another email or contact us." },
            { status: 409 },
          );
        }
        console.error("[members/register] supabase", error);
        return NextResponse.json(
          { error: "Could not save your registration. Check Supabase setup and try again." },
          { status: 500 },
        );
      }

      return NextResponse.json({ member: memberRowToMember(data, origin) });
    }

    if (!isGoogleSheetsConfigured()) {
      return NextResponse.json(
        {
          error:
            "Registration storage is not configured. Set GOOGLE_SHEETS_WEBAPP_URL and GOOGLE_SHEETS_API_TOKEN in .env.local.",
        },
        { status: 503 },
      );
    }

    try {
      const member = await registerMemberViaGoogleSheets(
        payload,
        phoneCheck.phoneE164,
        origin,
        requestMeta(request),
      );
      return NextResponse.json({ member });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Registration failed.";
      const status = message.includes("already registered") ? 409 : 500;
      return NextResponse.json({ error: message }, { status });
    }
  } catch (e) {
    console.error("[members/register]", e);
    const message =
      e instanceof Error && e.message.includes("Missing Supabase")
        ? "Server is not connected to Supabase yet."
        : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

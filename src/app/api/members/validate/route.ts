import {
  ipCountryIsoFromHeaders,
  isBetterDevCountry,
  validateRegistration,
} from "@/lib/phone-validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string; country?: string };
    const phone = typeof body.phone === "string" ? body.phone : "";
    const country = typeof body.country === "string" ? body.country.trim() : "";

    if (!isBetterDevCountry(country)) {
      return NextResponse.json({ error: "Select a valid country." }, { status: 400 });
    }

    const ipIso = ipCountryIsoFromHeaders(request.headers);
    const result = validateRegistration({ phone, country, ipCountryIso: ipIso });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ phoneE164: result.phoneE164 });
  } catch {
    return NextResponse.json({ error: "Validation failed." }, { status: 500 });
  }
}

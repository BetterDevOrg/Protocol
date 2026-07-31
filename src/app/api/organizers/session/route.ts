import {
  findOrganizerBySecretInGoogleSheets,
  listOrganizerEventsInGoogleSheets,
} from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { googleSheetsOrganizerToOrganizer } from "@/lib/google-sheets/organizers";
import { resolveOrganizerAuth } from "@/lib/organizer-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { secret?: string };
    const authResult = await resolveOrganizerAuth(body.secret);
    if ("error" in authResult) return authResult.error;

    if (authResult.context.mode === "legacy_secret") {
      return NextResponse.json({
        ok: true,
        mode: "founder",
        organizer: null,
        events: [],
      });
    }

    const organizer = authResult.context.organizer;
    const eventsResult = await listOrganizerEventsInGoogleSheets(organizer.organizerId);
    const events = eventsResult.ok ? eventsResult.events : [];

    return NextResponse.json({
      ok: true,
      mode: "city_organizer",
      organizer,
      events,
    });
  } catch (e) {
    console.error("[organizers/session POST]", e);
    return NextResponse.json({ error: "Could not validate organizer key." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  const secret = new URL(request.url).searchParams.get("secret")?.trim() ?? "";
  if (!secret) {
    return NextResponse.json({ error: "Organizer key is required." }, { status: 400 });
  }

  try {
    const result = await findOrganizerBySecretInGoogleSheets(secret);
    if (!result.ok) {
      return NextResponse.json({ error: "Invalid organizer key." }, { status: 401 });
    }

    const organizer = googleSheetsOrganizerToOrganizer(result.organizer);
    const eventsResult = await listOrganizerEventsInGoogleSheets(organizer.organizerId);

    return NextResponse.json({
      ok: true,
      organizer,
      events: eventsResult.ok ? eventsResult.events : [],
    });
  } catch (e) {
    console.error("[organizers/session GET]", e);
    return NextResponse.json({ error: "Could not load organizer session." }, { status: 500 });
  }
}

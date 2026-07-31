import {
  findOrganizerByOrganizerIdInGoogleSheets,
  listOrganizerEventsInGoogleSheets,
} from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { googleSheetsOrganizerToOrganizer } from "@/lib/google-sheets/organizers";
import { enrichOrganizerWithOnChainReputation } from "@/lib/organizer-reputation-display";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ organizerId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { organizerId } = await context.params;

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    const result = await findOrganizerByOrganizerIdInGoogleSheets(organizerId);
    if (!result.ok) {
      return NextResponse.json({ error: "Organizer not found." }, { status: 404 });
    }

    const organizer = await enrichOrganizerWithOnChainReputation(
      googleSheetsOrganizerToOrganizer(result.organizer),
    );
    if (organizer.status !== "active") {
      return NextResponse.json({ error: "Organizer not found." }, { status: 404 });
    }

    const eventsResult = await listOrganizerEventsInGoogleSheets(organizer.organizerId);
    const events = eventsResult.ok ? eventsResult.events : [];

    return NextResponse.json({ organizer, events });
  } catch (e) {
    console.error("[organizers/[organizerId]]", e);
    return NextResponse.json({ error: "Could not load organizer." }, { status: 500 });
  }
}

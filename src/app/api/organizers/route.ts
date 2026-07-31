import { listOrganizersInGoogleSheets } from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { googleSheetsOrganizerToOrganizer } from "@/lib/google-sheets/organizers";
import { enrichOrganizersWithOnChainReputation } from "@/lib/organizer-reputation-display";
import { NextResponse } from "next/server";

export async function GET() {
  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    const result = await listOrganizersInGoogleSheets("active");
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    const organizers = await enrichOrganizersWithOnChainReputation(
      result.organizers.map(googleSheetsOrganizerToOrganizer),
    );

    return NextResponse.json({ organizers });
  } catch (e) {
    console.error("[organizers]", e);
    return NextResponse.json({ error: "Could not load organizers." }, { status: 500 });
  }
}

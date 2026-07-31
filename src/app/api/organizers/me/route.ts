import {
  findMemberByEmailInGoogleSheets,
  findOrganizerByEmailInGoogleSheets,
  listOrganizerEventsInGoogleSheets,
} from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { googleSheetsOrganizerToOrganizer } from "@/lib/google-sheets/organizers";
import { enrichOrganizerWithOnChainReputation } from "@/lib/organizer-reputation-display";
import { readMemberSessionFromCookies } from "@/lib/member-session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await readMemberSessionFromCookies();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    const result = await findOrganizerByEmailInGoogleSheets(session.email);
    if (!result.ok) {
      return NextResponse.json({ authenticated: true, organizer: null });
    }

    const organizer = await enrichOrganizerWithOnChainReputation(
      googleSheetsOrganizerToOrganizer(result.organizer),
    );
    const eventsResult = await listOrganizerEventsInGoogleSheets(organizer.organizerId);
    const events = eventsResult.ok ? eventsResult.events : [];

    const memberResult = await findMemberByEmailInGoogleSheets(session.email);
    const communityId = memberResult.ok ? memberResult.member.communityId : organizer.communityId;

    return NextResponse.json({
      authenticated: true,
      organizer: {
        ...organizer,
        communityId,
      },
      events,
    });
  } catch (e) {
    console.error("[organizers/me]", e);
    return NextResponse.json({ error: "Could not load organizer profile." }, { status: 500 });
  }
}

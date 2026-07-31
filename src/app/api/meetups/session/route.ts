import { buildCheckinUrl, signCheckinToken } from "@/lib/checkin-token";
import { getEventMeetupId } from "@/lib/event-config";
import { resolveOrganizerAuth } from "@/lib/organizer-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { secret?: string; meetupId?: string };
    const authResult = await resolveOrganizerAuth(body.secret);
    if ("error" in authResult) return authResult.error;

    const meetupId = body.meetupId?.trim() || getEventMeetupId();
    const origin = new URL(request.url).origin;
    const token = signCheckinToken(meetupId);
    const checkinUrl = buildCheckinUrl(origin, meetupId, token);

    return NextResponse.json({ ok: true, meetupId, checkinUrl, token });
  } catch (e) {
    console.error("[meetups/session]", e);
    const message = e instanceof Error ? e.message : "Could not create check-in session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

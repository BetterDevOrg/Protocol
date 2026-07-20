import { buildCheckinUrl, signCheckinToken } from "@/lib/checkin-token";
import { getEventMeetupId } from "@/lib/event-config";
import { verifyOrganizerSecret } from "@/lib/organizer-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { secret?: string; meetupId?: string };
    const authError = verifyOrganizerSecret(body.secret);
    if (authError) return authError;

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

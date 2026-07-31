import {
  findMemberByEmailInGoogleSheets,
  getEventFromGoogleSheets,
  getMeetupRsvpsFromGoogleSheets,
  storeMeetupRsvpInGoogleSheets,
} from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { readMemberSessionFromCookies } from "@/lib/member-session";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ meetupId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { meetupId } = await context.params;
  const url = new URL(request.url);
  const communityId = url.searchParams.get("communityId")?.trim().toUpperCase() ?? "";

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    const slug = meetupId.trim().toLowerCase();
    const [eventResult, rsvpsResult] = await Promise.all([
      getEventFromGoogleSheets(slug),
      getMeetupRsvpsFromGoogleSheets(slug),
    ]);

    if (!eventResult.ok) {
      return NextResponse.json({ error: "Meetup event not found." }, { status: 404 });
    }
    if (!rsvpsResult.ok) {
      return NextResponse.json({ error: rsvpsResult.error }, { status: 502 });
    }

    const rsvped =
      communityId.length > 0
        ? rsvpsResult.rsvps.some((rsvp) => rsvp.communityId.trim().toUpperCase() === communityId)
        : undefined;

    return NextResponse.json({
      event: eventResult.event,
      rsvpCount: rsvpsResult.rsvps.length,
      rsvps: rsvpsResult.rsvps,
      ...(rsvped !== undefined ? { rsvped } : {}),
    });
  } catch (e) {
    console.error("[meetup-rsvp GET]", e);
    return NextResponse.json({ error: "Could not load RSVPs." }, { status: 500 });
  }
}

export async function POST(_request: Request, context: RouteContext) {
  const { meetupId } = await context.params;

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    const session = await readMemberSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Sign in to RSVP." }, { status: 401 });
    }

    const slug = meetupId.trim().toLowerCase();
    const [eventResult, memberResult] = await Promise.all([
      getEventFromGoogleSheets(slug),
      findMemberByEmailInGoogleSheets(session.email),
    ]);

    if (!eventResult.ok) {
      return NextResponse.json({ error: "Meetup event not found." }, { status: 404 });
    }
    if (!memberResult.ok) {
      return NextResponse.json({ error: "Member profile not found." }, { status: 404 });
    }

    const member = memberResult.member;
    const storeResult = await storeMeetupRsvpInGoogleSheets({
      meetupId: slug,
      communityId: member.communityId,
      email: member.email,
      fullName: member.fullName,
      city: member.city,
      country: member.country,
      xUsername: member.xUsername,
    });

    if (!storeResult.ok) {
      return NextResponse.json({ error: storeResult.error }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      alreadyRecorded: storeResult.alreadyRecorded,
      rsvp: storeResult.rsvp,
      event: eventResult.event,
    });
  } catch (e) {
    console.error("[meetup-rsvp POST]", e);
    return NextResponse.json({ error: "Could not record RSVP." }, { status: 500 });
  }
}

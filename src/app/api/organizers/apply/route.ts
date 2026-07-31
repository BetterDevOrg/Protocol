import {
  applyOrganizerInGoogleSheets,
  findMemberByEmailInGoogleSheets,
} from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { googleSheetsOrganizerToOrganizer } from "@/lib/google-sheets/organizers";
import { sendOrganizerApplicationToFounder } from "@/lib/organizer-email";
import { readMemberSessionFromCookies } from "@/lib/member-session";
import type { OrganizerApplyPayload } from "@/types/organizer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await readMemberSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Sign in to apply as a city organizer." }, { status: 401 });
  }

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as OrganizerApplyPayload;
    const city = body.city?.trim() ?? "";
    const country = body.country?.trim() ?? "";
    const bio = body.bio?.trim() ?? "";

    if (city.length < 2 || country.length < 2) {
      return NextResponse.json({ error: "City and country are required." }, { status: 400 });
    }

    const memberResult = await findMemberByEmailInGoogleSheets(session.email);
    if (!memberResult.ok || !memberResult.member) {
      return NextResponse.json({ error: "Member profile not found." }, { status: 404 });
    }

    const member = memberResult.member;
    const result = await applyOrganizerInGoogleSheets({
      email: member.email,
      communityId: member.communityId,
      fullName: member.fullName,
      city,
      country,
      xUsername: member.xUsername,
      bio,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    const organizer = googleSheetsOrganizerToOrganizer(result.organizer);

    if (result.created) {
      try {
        await sendOrganizerApplicationToFounder({
          organizer,
          applicantEmail: member.email,
        });
      } catch (emailError) {
        console.error("[organizers/apply email]", emailError);
      }
    }

    return NextResponse.json({
      created: result.created,
      organizer,
    });
  } catch (e) {
    console.error("[organizers/apply]", e);
    return NextResponse.json({ error: "Could not submit application." }, { status: 500 });
  }
}

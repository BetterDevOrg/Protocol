import {
  activateOrganizerInGoogleSheets,
  findOrganizerByOrganizerIdInGoogleSheets,
} from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { googleSheetsOrganizerToOrganizer } from "@/lib/google-sheets/organizers";
import { verifyFounderSecret } from "@/lib/organizer-auth";
import { sendOrganizerApprovedToApplicant } from "@/lib/organizer-email";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ organizerId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { organizerId } = await context.params;

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { founderSecret?: string };
    const founderError = verifyFounderSecret(body.founderSecret);
    if (founderError) return founderError;

    const existing = await findOrganizerByOrganizerIdInGoogleSheets(organizerId);
    if (!existing.ok) {
      return NextResponse.json({ error: "Organizer not found." }, { status: 404 });
    }

    const result = await activateOrganizerInGoogleSheets(organizerId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    const organizer = googleSheetsOrganizerToOrganizer(result.organizer);
    const applicantEmail = result.organizer.email ?? existing.organizer.email ?? "";

    if (applicantEmail) {
      try {
        await sendOrganizerApprovedToApplicant({
          organizer,
          organizerSecret: result.organizerSecret,
          applicantEmail,
        });
      } catch (emailError) {
        console.error("[organizers/approve email]", emailError);
      }
    }

    return NextResponse.json({
      ok: true,
      organizer,
      organizerSecret: result.organizerSecret,
      createUrl: "/organizer/create",
      emailed: Boolean(applicantEmail),
    });
  } catch (e) {
    console.error("[organizers/approve]", e);
    return NextResponse.json({ error: "Could not approve organizer." }, { status: 500 });
  }
}

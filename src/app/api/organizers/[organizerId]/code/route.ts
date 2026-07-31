import { findOrganizerByOrganizerIdInGoogleSheets, updateOrganizerCodeInGoogleSheets } from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { googleSheetsOrganizerToOrganizer } from "@/lib/google-sheets/organizers";
import { isPendingOrganizerCode } from "@/lib/organizer-code";
import {
  issueOrganizerVrfCode,
  organizerCodeExplorerLinks,
  readOrganizerCodeStatus,
} from "@/lib/organizer-code-service";
import { resolveOrganizerAuth } from "@/lib/organizer-auth";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ organizerId: string }>;
};

async function loadOrganizer(organizerId: string) {
  const result = await findOrganizerByOrganizerIdInGoogleSheets(organizerId);
  if (!result.ok) return null;
  return googleSheetsOrganizerToOrganizer(result.organizer);
}

export async function GET(_request: Request, context: RouteContext) {
  const { organizerId } = await context.params;

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    const organizer = await loadOrganizer(organizerId);
    if (!organizer || organizer.status !== "active") {
      return NextResponse.json({ error: "Organizer not found." }, { status: 404 });
    }

    const status = await readOrganizerCodeStatus({
      organizerId: organizer.organizerId,
      sheetCode: organizer.organizerCode,
      sheetVrfFulfilled: organizer.codeVrfFulfilled,
      sheetVrfSeed: organizer.codeVrfSeed,
    });

    if (
      status.vrfFulfilled &&
      (!organizer.codeVrfFulfilled || isPendingOrganizerCode(organizer.organizerCode))
    ) {
      await updateOrganizerCodeInGoogleSheets({
        organizerId: organizer.organizerId,
        organizerCode: status.organizerCode,
        vrfSeed: status.vrfSeed,
        vrfFulfilled: true,
      });
    }

    return NextResponse.json({
      ...status,
      links: organizerCodeExplorerLinks(status),
    });
  } catch (e) {
    console.error("[organizers/code GET]", e);
    return NextResponse.json({ error: "Could not load organizer code." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { organizerId } = await context.params;

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { secret?: string };
    const authResult = await resolveOrganizerAuth(body.secret);
    if ("error" in authResult) return authResult.error;

    const organizer = await loadOrganizer(organizerId);
    if (!organizer || organizer.status !== "active") {
      return NextResponse.json({ error: "Active organizer not found." }, { status: 404 });
    }

    if (
      authResult.context.mode === "city_organizer" &&
      authResult.context.organizer.organizerId !== organizer.organizerId
    ) {
      return NextResponse.json({ error: "You can only issue your own organizer code." }, { status: 403 });
    }

    const origin = new URL(request.url).origin;
    const issued = await issueOrganizerVrfCode({
      organizerId: organizer.organizerId,
      origin,
    });

    return NextResponse.json({
      ok: true,
      ...issued,
      links: organizerCodeExplorerLinks(issued),
      canRetry: issued.pending || isPendingOrganizerCode(issued.organizerCode),
    });
  } catch (e) {
    console.error("[organizers/code POST]", e);
    const message = e instanceof Error ? e.message : "Could not issue organizer code.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import {
  getBuilderCircleEligibility,
  parseBuilderCirclePoolMode,
  runBuilderCircleAssignment,
  toPublicAssignment,
} from "@/lib/builder-circle-service";
import { findMemberCircle } from "@/lib/builder-circle-matching";
import { getBuilderCirclesFromGoogleSheets } from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { resolveOrganizerAuth } from "@/lib/organizer-auth";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ meetupId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { meetupId } = await context.params;
  const url = new URL(request.url);
  const communityId = url.searchParams.get("communityId")?.trim().toUpperCase() ?? "";
  const eligibilityPreview = url.searchParams.get("eligibility") === "true";
  const poolMode = parseBuilderCirclePoolMode(url.searchParams.get("poolMode"));

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    if (eligibilityPreview) {
      const secret = url.searchParams.get("secret")?.trim() ?? "";
      const authResult = await resolveOrganizerAuth(secret);
      if ("error" in authResult) return authResult.error;

      const eligibility = await getBuilderCircleEligibility(authResult.context, meetupId, poolMode);
      if ("error" in eligibility) {
        return NextResponse.json({ error: eligibility.error }, { status: eligibility.status });
      }

      return NextResponse.json(eligibility);
    }

    const result = await getBuilderCirclesFromGoogleSheets(meetupId);
    if (!result.ok) {
      return NextResponse.json({ assigned: false, meetupId }, { status: 200 });
    }

    const assignment = toPublicAssignment(result.assignment);
    const myCircle = communityId ? findMemberCircle(result.assignment.circles, communityId) : null;

    return NextResponse.json({
      assigned: true,
      assignment,
      myCircle,
    });
  } catch (e) {
    console.error("[builder-circles GET]", e);
    return NextResponse.json({ error: "Could not load Builder Circles." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { meetupId } = await context.params;

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      secret?: string;
      groupSize?: number;
      requestVrf?: boolean;
      poolMode?: string;
    };

    const authResult = await resolveOrganizerAuth(body.secret);
    if ("error" in authResult) return authResult.error;

    const outcome = await runBuilderCircleAssignment(authResult.context, meetupId, {
      groupSize: body.groupSize,
      requestVrf: body.requestVrf === true,
      poolMode: parseBuilderCirclePoolMode(body.poolMode),
    });

    if ("error" in outcome) {
      return NextResponse.json(
        { error: outcome.error, stats: outcome.stats },
        { status: outcome.status },
      );
    }

    return NextResponse.json({
      ok: true,
      assignment: toPublicAssignment(outcome.assignment),
      vrfPending: outcome.vrfPending ?? false,
      vrfRequestTx: outcome.vrfRequestTx,
      emails: outcome.emails,
    });
  } catch (e) {
    console.error("[builder-circles POST]", e);
    const message = e instanceof Error ? e.message : "Could not assign Builder Circles.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

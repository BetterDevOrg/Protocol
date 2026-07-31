import { resolveAppOrigin } from "@/lib/app-origin";
import { buildCheckinUrl, signCheckinToken } from "@/lib/checkin-token";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import {
  recordEventInGoogleSheets,
} from "@/lib/google-sheets/client";
import {
  buildMeetupMetadataUri,
  normalizeMeetupSlug,
  validateMeetupSlug,
} from "@/lib/meetup-slug";
import { resolveOrganizerAuth, validateOrganizerEventCity } from "@/lib/organizer-auth";
import { ORGANIZER_REP_EVENT_TYPES } from "@/lib/organizer-reputation";
import { recordOrganizerReputationAction } from "@/lib/organizer-reputation-onchain";
import { createMeetupIfNeeded } from "@/lib/relayer";
import { NextResponse } from "next/server";

type CreateMeetupBody = {
  secret?: string;
  slug?: string;
  name?: string;
  city?: string;
  country?: string;
};

function validateEventFields(name: string, city: string): string | null {
  if (name.trim().length < 2) {
    return "Event name must be at least 2 characters.";
  }
  if (city.trim().length < 2) {
    return "City must be at least 2 characters.";
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateMeetupBody;
    const authResult = await resolveOrganizerAuth(body.secret);
    if ("error" in authResult) return authResult.error;

    const { context } = authResult;
    const slug = normalizeMeetupSlug(body.slug ?? "");
    const name = body.name?.trim() ?? "";
    const city = body.city?.trim() ?? "";
    const country =
      body.country?.trim() ||
      (context.mode === "city_organizer" ? context.organizer.country : "");

    const slugError = validateMeetupSlug(slug);
    if (slugError) {
      return NextResponse.json({ error: slugError }, { status: 400 });
    }

    const fieldError = validateEventFields(name, city);
    if (fieldError) {
      return NextResponse.json({ error: fieldError }, { status: 400 });
    }

    const cityError = validateOrganizerEventCity(context, city, country);
    if (cityError) return cityError;

    const requestOrigin = new URL(request.url).origin;
    const metadataOrigin = resolveAppOrigin(requestOrigin);
    const metadataURI = buildMeetupMetadataUri(metadataOrigin, slug);
    const { created, txHash } = await createMeetupIfNeeded(slug, metadataURI);

    const organizerId =
      context.mode === "city_organizer" ? context.organizer.organizerId : "";

    let storedOffChain = false;
    if (isGoogleSheetsConfigured()) {
      const sheetResult = await recordEventInGoogleSheets({
        slug,
        name,
        city,
        metadataUri: metadataURI,
        txHash,
        organizerId,
        country,
      });
      if (!sheetResult.ok) {
        return NextResponse.json(
          {
            error:
              "Event was registered on-chain but could not be saved to Google Sheets. Redeploy scripts/google-sheets-webapp.js with events support.",
            details: sheetResult.error,
            meetupId: slug,
            created,
            txHash,
            metadataURI,
          },
          { status: 502 },
        );
      }
      storedOffChain = true;

      if (context.mode === "city_organizer" && created) {
        await recordOrganizerReputationAction({
          organizerId: context.organizer.organizerId,
          eventType: ORGANIZER_REP_EVENT_TYPES.MEETUP_HOSTED,
          meetupSlug: slug,
          proofURI: metadataURI,
          incrementEventsHosted: true,
        });
      }
    }

    const token = signCheckinToken(slug);
    const checkinUrl = buildCheckinUrl(requestOrigin, slug, token);

    return NextResponse.json({
      ok: true,
      meetupId: slug,
      slug,
      name,
      city,
      country,
      organizerId: organizerId || undefined,
      created,
      txHash,
      metadataURI,
      storedOffChain,
      checkinUrl,
    });
  } catch (e) {
    console.error("[meetups/create]", e);
    const message = e instanceof Error ? e.message : "Could not create meetup.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

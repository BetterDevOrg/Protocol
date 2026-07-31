import { findOrganizerBySecretInGoogleSheets } from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { googleSheetsOrganizerToOrganizer } from "@/lib/google-sheets/organizers";
import { citiesMatch, countriesMatch } from "@/lib/organizer-city";
import type { Organizer } from "@/types/organizer";
import { NextResponse } from "next/server";

export function getOrganizerSessionSecret(): string | null {
  return process.env.ORGANIZER_SESSION_SECRET?.trim() || null;
}

export function verifyFounderSecret(providedSecret: string | undefined): NextResponse | null {
  const founderSecret = getOrganizerSessionSecret();
  if (!founderSecret) {
    return NextResponse.json({ error: "Founder organizer secret is not configured." }, { status: 503 });
  }
  if (providedSecret?.trim() !== founderSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

export type OrganizerAuthContext =
  | { mode: "legacy_secret"; bypassCityScope: true }
  | {
      mode: "city_organizer";
      bypassCityScope: false;
      organizer: Organizer;
    };

export async function resolveOrganizerAuth(providedSecret?: string): Promise<
  | { error: NextResponse }
  | { context: OrganizerAuthContext }
> {
  const trimmedSecret = providedSecret?.trim();
  if (!trimmedSecret) {
    return {
      error: NextResponse.json({ error: "Organizer key is required." }, { status: 401 }),
    };
  }

  const founderSecret = getOrganizerSessionSecret();
  if (founderSecret && trimmedSecret === founderSecret) {
    return { context: { mode: "legacy_secret", bypassCityScope: true } };
  }

  if (!isGoogleSheetsConfigured()) {
    return {
      error: NextResponse.json({ error: "Google Sheets is not configured." }, { status: 503 }),
    };
  }

  const result = await findOrganizerBySecretInGoogleSheets(trimmedSecret);
  if (!result.ok || !result.organizer) {
    return {
      error: NextResponse.json({ error: "Invalid organizer key." }, { status: 401 }),
    };
  }

  const organizer = googleSheetsOrganizerToOrganizer(result.organizer);
  if (organizer.status !== "active") {
    return {
      error: NextResponse.json(
        {
          error:
            organizer.status === "pending"
              ? "Your city organizer application is still pending approval."
              : "Your organizer account is not active.",
        },
        { status: 403 },
      ),
    };
  }

  return {
    context: {
      mode: "city_organizer",
      bypassCityScope: false,
      organizer,
    },
  };
}

export function validateOrganizerEventCity(
  context: OrganizerAuthContext,
  eventCity: string,
  eventCountry?: string,
): NextResponse | null {
  if (context.mode === "legacy_secret") {
    return null;
  }

  if (!citiesMatch(eventCity, context.organizer.city)) {
    return NextResponse.json(
      {
        error: `City organizers can only create events in ${context.organizer.city}.`,
      },
      { status: 403 },
    );
  }

  if (eventCountry && !countriesMatch(eventCountry, context.organizer.country)) {
    return NextResponse.json(
      {
        error: `City organizers can only create events in ${context.organizer.country}.`,
      },
      { status: 403 },
    );
  }

  return null;
}
